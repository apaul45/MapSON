describe("MapCard Tests", () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/home'));

  it('should expand card with description', () => {
    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
      .should('not.exist')

    cy.get('#expand-collapse-button').click()

    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
      .should('be.visible')

    cy.get('#expand-collapse-button').click()

    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
      .should('not.exist')
  })

  it('should upvote and unupvote a map', () => {
    cy.get('#upvote-count').then(($cnt) => {
      const upvote = Number($cnt.text())

      cy.get('#upvote-button').click()

      cy.get('#upvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text())
        expect(newUpvote).to.be.greaterThan(upvote)
      })

      cy.get('#upvote-button').click()

      cy.get('#upvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text())
        expect(newUpvote).to.be.eql(upvote)
      })
    })
  })

  it("should downvote and undownvote a map", () => {
    cy.get('#upvote-count').then(($cnt) => {
      const downvote = Number($cnt.text())

      cy.get('#downvote-button').click()

      cy.get('#downvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text())
        expect(newUpvote).to.be.greaterThan(downvote)
      })

      cy.get('#downvote-button').click()

      cy.get('#downvote-count').then(($cnt2) => {
        const newDownvote = Number($cnt2.text())
        expect(newDownvote).to.be.eql(downvote)
      })
    })
  })

  it('should unupvote and downvote a map', () => {
    cy.get('#upvote-button').click()
    cy.get('#upvote-count').then(($cnt) => {
      const upvote = Number($cnt.text())

      cy.get('#downvote-count').then(($cnt2) => {
        const downvote = Number($cnt2.text())
        
        cy.get('#downvote-button').click()

        cy.get('#upvote-count').then(($cnt3) => {
          const newUpvote = Number($cnt3.text())
          expect(newUpvote).to.be.lessThan(upvote)
        })

        cy.get('#downvote-count').then(($cnt2) => {
          const newDownvote = Number($cnt2.text())
          expect(newDownvote).to.be.greaterThan(downvote)
        })
      })
    })
  })

  it('should have more downloads on a map', () => {
    cy.get('#download-count').then(($cnt) => {
      const downloads = Number($cnt.text())

      cy.get('#download-button').click({force: true})

      cy.get('#download-count').then(($cnt2) => {
        const newDownloads = Number($cnt2.text())
        expect(newDownloads).to.be.greaterThan(downloads)
      })
    })
  })

})

export{}