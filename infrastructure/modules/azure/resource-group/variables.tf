# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

variable "name" {
  description = "Name of the resource group."
  type        = string

  validation {
    condition     = can(regex("^rg-[a-z0-9-]+$", var.name))
    error_message = "name must start with rg- and use lowercase letters, digits and hyphens."
  }
}

variable "location" {
  description = "Azure region for the resource group."
  type        = string
}
