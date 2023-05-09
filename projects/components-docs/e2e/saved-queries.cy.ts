// TODO
// doc-saved-queries-menu

import { compareScreenshots } from "./fn"

describe('components/saved-queries testing', () => {
  it('Can access the Saved Queries page', () => {
    cy.visit('components/saved-queries')
  })
  it('Has doc-edit-saved-query working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-edit-saved-query').get('sq-edit-saved-query').get('sq-modal')
    compareScreenshots('doc-edit-saved-query')
  })
  it('Has doc-export-query working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-export-query').get('sq-export-query').get('sq-modal')
    compareScreenshots('doc-export-query')
  })
  it('Has doc-facet-recent-documents working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-facet-recent-documents').get('sq-facet-recent-documents').get('.list-group')
    compareScreenshots('doc-facet-recent-documents')
  })
  it('Has doc-facet-recent-queries working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-facet-recent-queries').get('sq-facet-recent-queries').get('.list-group')
    compareScreenshots('doc-facet-recent-queries')
  })
  it('Has doc-facet-saved-queries working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-facet-saved-queries').get('sq-facet-saved-queries').get('.list-group')
    compareScreenshots('doc-facet-saved-queries')
  })
  it('Has doc-manage-saved-queries working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-manage-saved-queries').get('sq-manage-saved-queries').get('sq-modal')
    compareScreenshots('doc-manage-saved-queries')
  })
  it('Has doc-query-exporter working', () => {
    cy.visit('components/saved-queries')
    cy.get('doc-query-exporter').get('sq-query-exporter').get('button')
    compareScreenshots('doc-query-exporter')
  })
})