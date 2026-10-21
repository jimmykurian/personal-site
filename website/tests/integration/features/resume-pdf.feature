# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@resume
Feature: Resume PDF
  So that the downloadable resume always matches the site
  As the site's author
  I want /resume/ printed to a PDF from the build

  # Needs a local Chrome; skipped without one. CI's runners have it.
  @chrome
  Scenario: The built /resume/ page prints to a PDF
    Given the production build of the site
    When I print the resume with scripts/resume-pdf.mjs
    Then the script reports the file it wrote
    And the file is a PDF of at least 20 KB with at least one page
