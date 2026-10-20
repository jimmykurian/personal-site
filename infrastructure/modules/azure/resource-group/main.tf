# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

resource "azurerm_resource_group" "this" {
  name     = var.name
  location = var.location
}
