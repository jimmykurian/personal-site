# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@pages
Feature: Built pages
  So that every page can be found, read and shared
  As a visitor or a search engine
  I want each built page to be a complete, labelled HTML document

  Background:
    Given the production build of the site

  Scenario: Every route is built, with one page per published post and no drafts
    When I list the built pages
    Then they are the home, 404, privacy, reading, resume and writing pages, plus one page per published post
    And the draft template has no page

  Scenario: Every page is a complete, labelled HTML document
    When I check every built page
    Then each is in English, with a title, a viewport and exactly one h1

  Scenario: Indexed pages have a description, a canonical URL and a link preview on the www host
    When I check every page except the resume and the 404 page
    Then each has a description and a canonical URL on the www host
    And each link preview uses that URL and the default image

  Scenario Outline: The <name> page stays out of search results
    When I open "<file>"
    Then it is marked noindex
    And it has no canonical URL

    Examples:
      | name   | file               |
      | resume | /resume/index.html |
      | 404    | /404.html          |

  Scenario: The nav marks the current section
    When I find the current nav link on the writing and reading pages
    Then they are "/writing/" and "/reading/"

  Scenario: Every footer links the source repository
    When I collect the "Source" link from every page footer
    Then the home page is among them
    And every one points at the repository in site.json

  Scenario: Only the home page has Person structured data
    When I find the pages with JSON-LD
    Then only the home page has it
    And it describes the person on the www host
