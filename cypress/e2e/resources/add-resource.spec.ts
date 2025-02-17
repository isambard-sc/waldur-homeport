describe('Add resource button', () => {
  beforeEach(() => {
    cy.mockChecklists()

      .intercept('GET', '/api/configuration/', {
        fixture: 'support/configuration.json',
      })
      .intercept('GET', '/api/events/', [])
      .intercept('GET', '/api/roles/', { fixture: 'roles.json' })

      .intercept('GET', '/api/users/me/', {
        fixture: 'users/nonstaff.json',
      })

      .setToken()
      .visit('/profile/')
      .waitForSpinner();
  });

  it('Assure that Add resource button is not visible for users without organization affiliation', () => {
    cy.get('#kt_aside_menu_wrapper').should('exist');

    cy.get('#kt_aside_menu').contains('Add resource').should('not.exist');
  });
});
