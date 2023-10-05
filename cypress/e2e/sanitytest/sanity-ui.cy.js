/* eslint-disable camelcase */
/* eslint-disable no-undef */
/// <reference types="cypress" />

describe("Text and CSS Properties Test", () => {
  it("Checks text visibility and CSS properties on a URL", () => {
    // Visit the URL you want to test
    cy.visit("https://malibu-advanced-web.qtstage.io/");

    // Check if the URL contains specific text
    cy.url().should("include", "malibu-advanced");

    // Find the element containing the text you want to validate and click on ut

    // xpath = //h3[normalize-space()='AutoTest - Text Story'];
    const h3tag_autotest_textstory = "//h3[normalize-space()='AutoTest - Text Story']";
    cy.xpath(h3tag_autotest_textstory).click();

    //   cy.get('div') // You can replace 'div' with the appropriate selector of the parent element
    // .contains('h3', 'AutoTest - Text Story')
    // .click();

    // After clicking the element, you can use cy.url() to assert the current URL
    cy.url().should("eq", "https://malibu-advanced-web.qtstage.io/sports/cricket/autotest-text-story-10148");

    // const title_xpath = "//bdi[normalize-space()='AutoTest - Text Story']";
    const title = "//bdi[contains(text(),'AutoTest - Text Story')]";
    cy.xpath(title)
      .should("have.css", "font-family")
      .and("match", /Arial, sans-serif/);
    // const fontFamily_name = cy.get(a.fontFamily);
    // cy.wrap(a).invoke('css', 'font-family').should('match', /Arial, sans-serif/);

    // console.log('Actual Font Family:', fontFamily_name);
    cy.xpath(title).should("have.css", "font-size").and("eq", "40px");
    cy.xpath(title).should("have.css", "font-weight").and("eq", "700");
    // cy.get('your-element-selector').invoke('css', 'font-family').then((fontFamily) => {
    //   // Log the actual value to the Cypress command log
    //   cy.log('Actual Font Family:', fontFamily);

    // Use the variable in your assertions or other logic

    // You can add more CSS properties as needed

    // Perform additional assertions as required
    // For example, you can check the color, background-color, etc.

    // You can also interact with the page further and perform more tests
  });
});
