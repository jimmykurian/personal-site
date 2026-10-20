mock_provider "azurerm" {
  mock_resource "azurerm_static_web_app" {
    defaults = {
      id                = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-example/providers/Microsoft.Web/staticSites/example"
      default_host_name = "example-host.1.azurestaticapps.net"
      api_key           = "mock-deploy-token"
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
  location            = "westus2"
  custom_domains = {
    "www.example.com" = "cname-delegation"
    "example.com"     = "dns-txt-token"
  }
}

run "creates_the_app_in_the_group_and_region" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.name == "example"
    error_message = "The app must take its name from var.name."
  }

  assert {
    condition     = azurerm_static_web_app.this.resource_group_name == "rg-example" && azurerm_static_web_app.this.location == "westus2"
    error_message = "The app must be in var.resource_group_name and var.location."
  }
}

run "defaults_to_the_free_plan" {
  # Arrange: sku left at its default

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.sku_tier == "Free" && azurerm_static_web_app.this.sku_size == "Free"
    error_message = "The default plan must be Free, for both tier and size."
  }
}

run "sets_tier_and_size_from_sku" {
  # Arrange
  variables {
    sku = "Standard"
  }

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.sku_tier == "Standard" && azurerm_static_web_app.this.sku_size == "Standard"
    error_message = "sku must set both the tier and the size."
  }
}

run "rejects_another_plan" {
  # Arrange
  variables {
    sku = "Dedicated"
  }

  # Act
  command = plan

  # Assert
  expect_failures = [var.sku]
}

run "enables_previews_and_the_config_file_by_default" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.preview_environments_enabled
    error_message = "Pull request previews must be on by default."
  }

  assert {
    condition     = azurerm_static_web_app.this.configuration_file_changes_enabled
    error_message = "staticwebapp.config.json must be allowed to set routes and headers."
  }
}

run "can_turn_previews_off" {
  # Arrange
  variables {
    preview_environments_enabled = false
  }

  # Act
  command = plan

  # Assert
  assert {
    condition     = !azurerm_static_web_app.this.preview_environments_enabled
    error_message = "preview_environments_enabled = false must turn previews off."
  }
}

run "binds_each_custom_domain_to_the_app" {
  # Arrange: the variables above

  # Act
  command = apply

  # Assert
  assert {
    condition     = toset(keys(azurerm_static_web_app_custom_domain.this)) == toset(["www.example.com", "example.com"])
    error_message = "Every entry in var.custom_domains must be bound."
  }

  assert {
    condition     = alltrue([for name, d in azurerm_static_web_app_custom_domain.this : d.domain_name == name && d.static_web_app_id == azurerm_static_web_app.this.id])
    error_message = "Each domain must be bound by name to this app."
  }
}

run "validates_each_domain_as_given" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app_custom_domain.this["www.example.com"].validation_type == "cname-delegation"
    error_message = "www.example.com must validate by CNAME."
  }

  assert {
    condition     = azurerm_static_web_app_custom_domain.this["example.com"].validation_type == "dns-txt-token"
    error_message = "example.com must validate by TXT."
  }
}

run "binds_no_domains_by_default" {
  # Arrange
  variables {
    custom_domains = null
  }

  # Act
  command = plan

  # Assert
  assert {
    condition     = length(azurerm_static_web_app_custom_domain.this) == 0
    error_message = "With no custom domains, nothing must be bound."
  }
}

run "rejects_an_unknown_validation_type" {
  # Arrange
  variables {
    custom_domains = {
      "www.example.com" = "http-token"
    }
  }

  # Act
  command = plan

  # Assert
  expect_failures = [var.custom_domains]
}

run "returns_the_app" {
  # Arrange: the mocked app above

  # Act
  command = apply

  # Assert
  assert {
    condition     = output.id == "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-example/providers/Microsoft.Web/staticSites/example"
    error_message = "id must be the app's resource ID."
  }

  assert {
    condition     = output.name == "example" && output.sku == "Free"
    error_message = "name and sku must come from the app."
  }

  assert {
    condition     = output.default_host_name == "example-host.1.azurestaticapps.net"
    error_message = "default_host_name must be the app's azurestaticapps.net host."
  }
}

run "returns_each_domain_with_its_validation_and_token" {
  # Arrange: the variables above

  # Act
  command = apply

  # Assert
  assert {
    condition = output.custom_domains == {
      "www.example.com" = "cname-delegation"
      "example.com"     = "dns-txt-token"
    }
    error_message = "custom_domains must map each bound domain to its validation type."
  }

  assert {
    condition     = nonsensitive(output.validation_tokens) == { "www.example.com" = "mock-validation-token", "example.com" = "mock-validation-token" }
    error_message = "validation_tokens must have a token for each domain."
  }

  assert {
    condition     = nonsensitive(output.api_key) == "mock-deploy-token"
    error_message = "api_key must be the app's deploy token."
  }
}
