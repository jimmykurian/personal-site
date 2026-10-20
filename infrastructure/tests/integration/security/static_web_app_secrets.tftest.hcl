# module: azure/static-web-app

mock_provider "azurerm" {
  mock_resource "azurerm_static_web_app" {
    defaults = {
      id      = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-example/providers/Microsoft.Web/staticSites/example"
      api_key = "mock-deploy-token"
    }
  }

  mock_resource "azurerm_static_web_app_custom_domain" {
    defaults = {
      validation_token = "mock-validation-token"
    }
  }
}

variables {
  name                = "example"
  resource_group_name = "rg-example"
  location            = "eastus2"
  custom_domains = {
    "www.example.com" = "cname-delegation"
    "example.com"     = "dns-txt-token"
  }
}

run "keeps_the_deploy_and_validation_tokens_sensitive" {
  # Arrange: the mocked app and domains above

  # Act
  command = apply

  # Assert
  assert {
    condition     = issensitive(output.api_key)
    error_message = "The deploy token must never print in plan or apply output."
  }

  assert {
    condition     = issensitive(output.validation_tokens)
    error_message = "Domain validation tokens must never print in plan or apply output."
  }
}

run "prints_only_public_values" {
  # Arrange: the mocked app above

  # Act
  command = apply

  # Assert
  assert {
    condition     = !issensitive(output.default_host_name) && !issensitive(output.custom_domains)
    error_message = "The host name and domain list are public and should print."
  }
}

run "stores_no_secrets_on_the_app" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = length(azurerm_static_web_app.this.app_settings == null ? {} : azurerm_static_web_app.this.app_settings) == 0
    error_message = "A static site needs no app settings, so none can leak."
  }

  assert {
    condition     = length(azurerm_static_web_app.this.basic_auth) == 0
    error_message = "The public site has no password to store."
  }

  assert {
    condition     = length(azurerm_static_web_app.this.identity) == 0
    error_message = "The app needs no managed identity, so it can't reach other resources."
  }
}

run "stays_publicly_reachable" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.public_network_access_enabled
    error_message = "The site is public; disabling public access would take it offline."
  }
}
