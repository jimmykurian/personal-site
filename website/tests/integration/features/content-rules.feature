# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@content-rules
Feature: Content rules across the whole build
  So that nothing private is ever published
  As the site's author
  I want every published file checked against the content rules

  Background:
    Given the production build of the site

  # Every rule in tests/support/rules.ts, read at run time, so a new rule is checked without
  # editing this file: a personal Gmail address, a phone number, a security clearance, a patent
  # application number and a street address.
  Scenario: No published file breaks a content rule
    When I read every published text file
    Then none of them matches any content rule in tests/support/rules.ts

  Scenario: hello@ is the only email address
    When I collect every email address in the published pages and feeds
    Then the only one is the contact address in site.json

  Scenario: The private resume original is never published
    When I list the built files
    Then none is under /private/ or is a resume document
