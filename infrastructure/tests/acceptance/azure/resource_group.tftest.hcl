mock_provider "azurerm" {
  mock_resource "azurerm_resource_group" {
    defaults = {
      id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-example"
    }
  }
}

variables {
  name     = "rg-example"
  location = "westus2"
}

run "creates_the_named_group_in_the_given_region" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = azurerm_resource_group.this.name == "rg-example"
    error_message = "The group must take its name from var.name."
  }

  assert {
    condition     = azurerm_resource_group.this.location == "westus2"
    error_message = "The group must take its region from var.location."
  }
}

run "adds_no_tags" {
  # Arrange: the variables above

  # Act
  command = plan

  # Assert
  assert {
    condition     = length(azurerm_resource_group.this.tags == null ? {} : azurerm_resource_group.this.tags) == 0
    error_message = "The live group has no tags; adding them would change it on the next apply."
  }
}

run "accepts_an_rg_prefixed_name" {
  # Arrange
  variables {
    name = "rg-personal-site"
  }

  # Act
  command = plan

  # Assert
  assert {
    condition     = var.name == "rg-personal-site"
    error_message = "An rg- name in lowercase must be accepted."
  }
}

run "rejects_a_name_without_the_rg_prefix" {
  # Arrange
  variables {
    name = "personal-site"
  }

  # Act
  command = plan

  # Assert
  expect_failures = [var.name]
}

run "rejects_uppercase_and_spaces" {
  # Arrange
  variables {
    name = "rg-Personal Site"
  }

  # Act
  command = plan

  # Assert
  expect_failures = [var.name]
}

run "returns_the_id_name_and_location" {
  # Arrange: the variables and mocked group above

  # Act
  command = apply

  # Assert
  assert {
    condition     = output.id == "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-example"
    error_message = "id must be the group's resource ID."
  }

  assert {
    condition     = output.name == "rg-example" && output.location == "westus2"
    error_message = "name and location must come from the group."
  }
}
