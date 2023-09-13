/// <reference types="cypress" />



describe('Text and CSS Properties Test', () => {
  it('Checks text visibility and CSS properties on a URL', () => {
    // Visit the URL you want to test
    cy.visit('https://malibu-advanced-web.qtstage.io/');

    // Check if the URL contains specific text
    cy.url().should('include', 'malibu-advanced');

    // Find the element containing the text you want to validate
    cy.get('h3').should('be.visible').should('contain.text', 'AutoTest - Text Story');
    //xpath = //h3[normalize-space()='AutoTest - Text Story'];
    cy.xpath("//h3[normalize-space()='AutoTest - Text Story']").click();
  //   cy.get('div') // You can replace 'div' with the appropriate selector of the parent element
  // .contains('h3', 'AutoTest - Text Story')
  // .click();

  // After clicking the element, you can use cy.url() to assert the current URL
cy.url().should('eq', 'https://malibu-advanced-web.qtstage.io/sports/cricket/autotest-text-story-10148');

    const title_xpath = "//*[@id=\"container\"]/div/div/div[1]/div/div[2]/div[2]/div[1]/h1/bdi";
    // Get the computed CSS properties of the element
    cy.get('h1').should('have.css', 'font-family').and('match', /Arial, sans-serif/);
    cy.get('h1').should('have.css', 'font-size').and('eq', '40px');
    cy.get('h1').should('have.css', 'font-weight').and('eq', 'bold');

    // You can add more CSS properties as needed

    // Perform additional assertions as required
    // For example, you can check the color, background-color, etc.

    // You can also interact with the page further and perform more tests
  });
});
