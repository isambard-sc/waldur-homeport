describe('User manage', () => {
  beforeEach(() => {
    cy.mockUser()
      .mockChecklists()
      .intercept('GET', '/api/support-templates/', [])
      .intercept('PATCH', '/api/users/3a836bc76e1b40349ec1a0d8220f374f/', {
        fixture: 'users/alice.json',
      })
      .intercept('HEAD', '/api/customers/', [])
      .intercept(
        'GET',
        '/api/marketplace-categories/?field=uuid&field=title&has_offerings=true',
        [],
      )
      .intercept('GET', '/api/customers/**', [])
      .setToken()
      .visit('/profile/manage/');
  });

  it('allows to update user details', () => {
    cy
      // Ensure that first_name input field is present
      .get('input[name="first_name"]')

      // Ensure that Change email button is present
      .get('button')
      .contains('Request change')
      .click();

    // Close dialog
    cy.get('.modal-footer')
      .should('be.visible')
      .get('.modal-footer button:contains(Cancel)')
      .click();
    // Ensure that organization input field is present
    cy.get('input[name="organization"]')

      // Ensure that job_title input field is present
      .get('input[name="job_title"]')

      // Ensure that description input field is present
      .get('input[name="description"]')

      // Adding text to ensure that 'discard' and 'save changes' buttons appear
      .type('some text')

      // Ensure that phone_number input field is present
      .get('input[name="phone_number"]');

    // Ensure that Request deletion button works
    /*.get('input[type="checkbox"]')
      .last()
      .click()
      .get('button')
      .contains('Request deletion')
      .click()

      // Close remove profile dialog
      .get('button')
      .contains('Cancel')
      .last()
      .click()

      // Ensure that Discard button exists and works
      .get('button')
      .contains('Discard')
      .click()*/
  });
});
