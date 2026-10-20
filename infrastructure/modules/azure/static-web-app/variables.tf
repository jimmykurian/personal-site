# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

variable "name" {
  description = "Name of the Static Web App."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that holds the Static Web App."
  type        = string
}

variable "location" {
  description = "Azure region for the Static Web App."
  type        = string
}

variable "sku" {
  description = "Plan for the Static Web App: Free or Standard."
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku)
    error_message = "sku must be Free or Standard."
  }
}

variable "preview_environments_enabled" {
  description = "Deploy each pull request to its own preview environment."
  type        = bool
  default     = true
}

variable "custom_domains" {
  description = "Custom domains to bind, mapped to their validation type. Apex domains must use dns-txt-token."
  type        = map(string)
  default     = {}
  nullable    = false

  validation {
    condition     = alltrue([for type in values(var.custom_domains) : contains(["cname-delegation", "dns-txt-token"], type)])
    error_message = "Each custom domain must use cname-delegation or dns-txt-token."
  }

  validation {
    condition     = alltrue([for domain, type in var.custom_domains : length(split(".", domain)) > 2 || type == "dns-txt-token"])
    error_message = "Apex domains can only be validated with dns-txt-token."
  }
}
