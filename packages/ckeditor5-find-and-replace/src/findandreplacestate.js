/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplacestate
 */

import { Plugin } from 'ckeditor5/src/core';
import { ObservableMixin, mix, Collection } from 'ckeditor5/src/utils';

/**
 * The object storing find & replace plugin state in a given editor instance.
 *
 */
export default class FindAndReplaceState extends Plugin {
	constructor( model ) {
		super();

		/**
		 * A collection of results.
		 *
		 * @private
		 * @member {module:utils/collection~Collection}
		 */
		this.set( 'results', new Collection() );

		/**
		 * Currently highlighted search result in {@link #matchCount matched results}.
		 *
		 * @readonly
		 * @observable
		 * @member {Object|null} #highlightedResult
		 */
		this.set( 'highlightedResult', null );

		/**
		 * Searched text value.
		 *
		 * @readonly
		 * @observable
		 * @member {String} #searchText
		 */
		this.set( 'searchText', '' );

		/**
		 * Replace text value.
		 *
		 * @readonly
		 * @observable
		 * @member {String} #replaceText
		 */
		this.set( 'replaceText', '' );

		/**
		 * Indicates if the matchCase checkbox has been checked.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #matchCase
		 */
		this.set( 'matchCase', false );

		/**
		 * Indicates if the matchWholeWords checkbox has been checked.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #matchWholeWords
		 */
		this.set( 'matchWholeWords', false );

		this.results.on( 'change', ( eventInfo, { removed, index } ) => {
			removed = Array.from( removed );

			if ( removed.length ) {
				let highlightedResultRemoved = false;

				model.change( writer => {
					for ( const removedResult of removed ) {
						if ( this.highlightedResult === removedResult ) {
							highlightedResultRemoved = true;
						}

						if ( model.markers.has( removedResult.marker.name ) ) {
							writer.removeMarker( removedResult.marker );
						}
					}
				} );

				if ( highlightedResultRemoved ) {
					const nextHighlightedIndex = index >= this.results.length ? 0 : index;
					this.highlightedResult = this.results.get( nextHighlightedIndex );
				}
			}
		} );
	}

	clear( model ) {
		// @todo: actually this handling might be moved to editing part.
		// This could be a results#change listener that would ensure that related markers are ALWAYS removed without
		// having to call state.clear() explicitly.

		this.searchText = '';
		// this.replaceText = '';

		model.change( writer => {
			if ( this.highlightedResult ) {
				const oldMatchId = this.highlightedResult.marker.name.split( ':' )[ 1 ];
				const oldMarker = model.markers.get( `findResultHighlighted:${ oldMatchId }` );

				if ( oldMarker ) {
					writer.removeMarker( oldMarker );
				}
			}

			[ ...this.results ].forEach( ( { marker } ) => {
				writer.removeMarker( marker );
			} );
		} );

		this.results.clear();
	}
}

mix( FindAndReplaceState, ObservableMixin );
