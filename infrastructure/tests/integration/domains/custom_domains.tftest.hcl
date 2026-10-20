# module: azure/static-web-app
# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

mock_provider "azurerm" {
  mock_resource "azurerm_static_web_app" {
    defaults = {
      id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-personal-site/providers/Microsoft.Web/staticSites/jimmykurian-me"
    }
  }
}

# The live site's values.
variables {
  name                = "jimmykurian-me"
  resource_group_name = "rg-personal-site"
  location            = "eastus2"
  sku                 = "Free"
  custom_domains = {
    "www.jimmykurian.me" = "cname-delegation"
    "jimmykurian.me"     = "dns-txt-token"
  }
}

run "binds_www_by_cname_and_the_apex_by_txt" {
  # Arrange: the production domains above

  # Act
  command = apply

  # Assert
  assert {
    condition = output.custom_domains == {
      "www.jimmykurian.me" = "cname-delegation"
      "jimmykurian.me"     = "dns-txt-token"
    }
    error_message = "Production must bind www by CNAME and the apex by TXT."
  }
}

run "rejects_cname_validation_for_an_apex" {
  # Arrange
  variables {
    custom_domains = {
      "jimmykurian.me" = "cname-delegation"
    }
  }

  # Act
  command = plan

  # Assert
  expect_failures = [var.custom_domains]
}

run "accepts_txt_validation_for_a_subdomain" {
  # Arrange
  variables {
    custom_domains = {
      "www.jimmykurian.me" = "dns-txt-token"
    }
  }

  # Act
  command = plan

  # Assert
  assert {
    condition     = var.custom_domains["www.jimmykurian.me"] == "dns-txt-token"
    error_message = "A subdomain may validate by TXT."
  }
}

run "keeps_the_site_on_the_free_plan_in_east_us_2" {
  # Arrange: the production values above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_static_web_app.this.sku_tier == "Free" && azurerm_static_web_app.this.location == "eastus2"
    error_message = "Production runs on the Free plan in East US 2."
  }
}
