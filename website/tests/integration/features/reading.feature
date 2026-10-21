# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

# Built from the live Goodreads feeds, so these check the page's shape, not specific books.
@reading
Feature: Reading page from the live Goodreads shelves
  So that visitors see what I'm reading and recommend
  As the site's author
  I want /reading/ filled from my Goodreads shelves at build time

  Background:
    Given the production build of the site
    And the reading page

  Scenario: The favorites and software-engineering shelves have books
    When I count the books on the favorites and software-engineering shelves
    Then each shelf has at least one

  Scenario: Every book links to its Goodreads page
    When I collect the book links
    Then there is at least one link
    And every one is a Goodreads book page

  Scenario: A long shelf pages ten at a time, with every book in the HTML
    When I look at the software-engineering shelf
    Then it has a "more" button only if it has more than ten books
    And no book is hidden in the HTML, for readers without JavaScript

  Scenario: The paging script ships
    When I collect the page's module scripts
    Then there is at least one script
