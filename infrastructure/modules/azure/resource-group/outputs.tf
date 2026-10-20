# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

output "id" {
  description = "ID of the resource group."
  value       = azurerm_resource_group.this.id
}

output "name" {
  description = "Name of the resource group."
  value       = azurerm_resource_group.this.name
}

output "location" {
  description = "Region of the resource group."
  value       = azurerm_resource_group.this.location
}
