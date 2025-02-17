/*
 * This combined file was created by the DataTables downloader builder:
 *   https://datatables.net/download
 *
 * To rebuild or modify this file with the latest versions of the included
 * software please visit:
 *   https://datatables.net/download/#bs5/dt-2.2.2/b-3.2.2/b-colvis-3.2.2/cr-2.0.4/fc-5.0.4/fh-4.0.1/r-3.0.4/rr-1.5.0/sc-2.4.3/sl-3.0.0/sr-1.4.1
 *
 * Included libraries:
 *   DataTables 2.2.2, Buttons 3.2.2, Column visibility 3.2.2, ColReorder 2.0.4, FixedColumns 5.0.4, FixedHeader 4.0.1, Responsive 3.0.4, RowReorder 1.5.0, Scroller 2.4.3, Select 3.0.0, StateRestore 1.4.1
 */

/*! DataTables 2.2.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		// jQuery's factory checks for a global window - if it isn't present then it
		// returns a factory function that expects the window object
		var jq = require('jquery');

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				return factory( $, root, root.document );
			};
		}
		else {
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		window.DataTable = factory( jQuery, window, document );
	}
}(function( $, window, document ) {
	"use strict";

	
	var DataTable = function ( selector, options )
	{
		// Check if called with a window or jQuery object for DOM less applications
		// This is for backwards compatibility
		if (DataTable.factory(selector, options)) {
			return DataTable;
		}
	
		// When creating with `new`, create a new DataTable, returning the API instance
		if (this instanceof DataTable) {
			return $(selector).DataTable(options);
		}
		else {
			// Argument switching
			options = selector;
		}
	
		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;
	
		if ( emptyInit ) {
			options = {};
		}
	
		// Method to get DT API instance from jQuery object
		this.api = function ()
		{
			return new _Api( this );
		};
	
		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;
	
			
			var i=0, iLen;
			var sId = this.getAttribute( 'id' );
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			$(this).trigger( 'options.dt', oInit );
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ), true );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						new DataTable.Api(s).destroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId,
				colgroup: $('<colgroup>').prependTo(this),
				fastData: function (row, column, type) {
					return _fnGetCellData(oSettings, row, column, type);
				}
			} );
			oSettings.nTable = this;
			oSettings.oInit  = oInit;
			
			allSettings.push( oSettings );
			
			// Make a single API instance available for internal handling
			oSettings.api = new _Api( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0])
					? oInit.aLengthMenu[0][0]
					: $.isPlainObject( oInit.aLengthMenu[0] )
						? oInit.aLengthMenu[0].value
						: oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"ajax",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"iStateDuration",
				"bSortCellsTop",
				"iTabIndex",
				"sDom",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				"caption",
				"layout",
				"orderDescReverse",
				"typeDetect",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback );
			
			oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			var oClasses = oSettings.oClasses;
			
			$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			$this.addClass( oClasses.table );
			
			if (! oSettings.oFeatures.bPaginate) {
				oInit.iDisplayStart = 0;
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			var defer = oInit.iDeferLoading;
			if ( defer !== null )
			{
				oSettings.deferLoading = true;
			
				var tmp = Array.isArray(defer);
				oSettings._iRecordsDisplay = tmp ? defer[0] : defer;
				oSettings._iRecordsTotal = tmp ? defer[1] : defer;
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var columnsInit = [];
			var thead = this.getElementsByTagName('thead');
			var initHeaderLayout = _fnDetectHeader( oSettings, thead[0] );
			
			// If we don't have a columns array, then generate one with nulls
			if ( oInit.aoColumns ) {
				columnsInit = oInit.aoColumns;
			}
			else if ( initHeaderLayout.length ) {
				for ( i=0, iLen=initHeaderLayout[0].length ; i<iLen ; i++ ) {
					columnsInit.push( null );
				}
			}
			
			// Add the columns
			for ( i=0, iLen=columnsInit.length ; i<iLen ; i++ ) {
				_fnAddColumn( oSettings );
			}
			
			// Apply the column definitions
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			var rowOne = $this.children('tbody').find('tr').eq(0);
			
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$( rowOne[0] ).children('th, td').each( function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if (! col) {
						_fnLog( oSettings, 0, 'Incorrect column count', 18 );
					}
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
							col._isArrayHost = true;
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			// Must be done after everything which can be overridden by the state saving!
			_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState );
			
			var features = oSettings.oFeatures;
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
			}
			
			// If aaSorting is not defined, then we use the first indicator in asSorting
			// in case that has been altered, so the default sort reflects that option
			if ( oInit.aaSorting === undefined ) {
				var sorting = oSettings.aaSorting;
				for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
					sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
				}
			}
			
			// Do a first pass on the sorting classes (allows any size changes to be taken into
			// account, and also will apply sorting disabled classes if disabled
			_fnSortingClasses( oSettings );
			
			_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
				if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
					_fnSortingClasses( oSettings );
				}
			} );
			
			
			/*
			 * Table HTML init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			var caption = $this.children('caption');
			
			if ( oSettings.caption ) {
				if ( caption.length === 0 ) {
					caption = $('<caption/>').appendTo( $this );
				}
			
				caption.html( oSettings.caption );
			}
			
			// Store the caption side, so we can remove the element from the document
			// when creating the element
			if (caption.length) {
				caption[0]._captionSide = caption.css('caption-side');
				oSettings.captionNode = caption[0];
			}
			
			if ( thead.length === 0 ) {
				thead = $('<thead/>').appendTo($this);
			}
			oSettings.nTHead = thead[0];
			
			var tbody = $this.children('tbody');
			if ( tbody.length === 0 ) {
				tbody = $('<tbody/>').insertAfter(thead);
			}
			oSettings.nTBody = tbody[0];
			
			var tfoot = $this.children('tfoot');
			if ( tfoot.length === 0 ) {
				// If we are a scrolling table, and no footer has been given, then we need to create
				// a tfoot element for the caption element to be appended to
				tfoot = $('<tfoot/>').appendTo($this);
			}
			oSettings.nTFoot = tfoot[0];
			
			// Copy the data index array
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			// Initialisation complete - table can be drawn
			oSettings.bInitialised = true;
			
			// Language definitions
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl ) {
				// Get the language definitions from a file
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json, oSettings.oInit.oLanguage );
			
						_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file
						_fnLog( oSettings, 0, 'i18n file loading error', 21 );
			
						// Continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
			}
			else {
				_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
				_fnInitialise( oSettings );
			}
		} );
		_that = null;
		return this;
	};
	
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "bs5/dt-2.2.2/b-3.2.2/b-colvis-3.2.2/cr-2.0.4/fc-5.0.4/fh-4.0.1/r-3.0.4/rr-1.5.0/sc-2.4.3/sl-3.0.0/sr-1.4.1",
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Legacy so v1 plug-ins don't throw js errors on load
		 */
		feature: [],
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an object of callbacks which provide the features for DataTables
		 * to be initialised via the `layout` option.
		 */
		features: {},
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Automatic column class assignment
			 */
			className: {},
	
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
			/**
			 * Automatic renderer assignment
			 */
			render: {},
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatibility only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		container: 'dt-container',
		empty: {
			row: 'dt-empty'
		},
		info: {
			container: 'dt-info'
		},
		layout: {
			row: 'dt-layout-row',
			cell: 'dt-layout-cell',
			tableRow: 'dt-layout-table',
			tableCell: '',
			start: 'dt-layout-start',
			end: 'dt-layout-end',
			full: 'dt-layout-full'
		},
		length: {
			container: 'dt-length',
			select: 'dt-input'
		},
		order: {
			canAsc: 'dt-orderable-asc',
			canDesc: 'dt-orderable-desc',
			isAsc: 'dt-ordering-asc',
			isDesc: 'dt-ordering-desc',
			none: 'dt-orderable-none',
			position: 'sorting_'
		},
		processing: {
			container: 'dt-processing'
		},
		scrolling: {
			body: 'dt-scroll-body',
			container: 'dt-scroll',
			footer: {
				self: 'dt-scroll-foot',
				inner: 'dt-scroll-footInner'
			},
			header: {
				self: 'dt-scroll-head',
				inner: 'dt-scroll-headInner'
			}
		},
		search: {
			container: 'dt-search',
			input: 'dt-input'
		},
		table: 'dataTable',	
		tbody: {
			cell: '',
			row: ''
		},
		thead: {
			cell: '',
			row: ''
		},
		tfoot: {
			cell: '',
			row: ''
		},
		paging: {
			active: 'current',
			button: 'dt-paging-button',
			container: 'dt-paging',
			disabled: 'disabled',
			nav: ''
		}
	} );
	
	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<([^>]*>)/g;
	var _max_str_len = Math.pow(2, 28);
	
	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// https://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted, allowEmpty ) {
		var type = typeof d;
		var strType = type === 'string';
	
		if ( type === 'number' || type === 'bigint') {
			return true;
		}
	
		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return !isNaN( parseFloat(d) ) && isFinite( d );
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	// Is a string a number surrounded by HTML?
	var _htmlNumeric = function ( d, decimalPoint, formatted, allowEmpty ) {
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		// input and select strings mean that this isn't just a number
		if (typeof d === 'string' && d.match(/<(input|select)/i)) {
			return null;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted, allowEmpty ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] && a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] ) {
					out.push( a[ order[i] ][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	// Replaceable function in api.util
	var _stripHtml = function (input) {
		if (! input || typeof input !== 'string') {
			return input;
		}
	
		// Irrelevant check to workaround CodeQL's false positive on the regex
		if (input.length > _max_str_len) {
			throw new Error('Exceeded max str len');
		}
	
		var previous;
	
		input = input.replace(_re_html, ''); // Complete tags
	
		// Safety for incomplete script tag - use do / while to ensure that
		// we get all instances
		do {
			previous = input;
			input = input.replace(/<script/i, '');
		} while (input !== previous);
	
		return previous;
	};
	
	// Replaceable function in api.util
	var _escapeHtml = function ( d ) {
		if (Array.isArray(d)) {
			d = d.join(',');
		}
	
		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};
	
	// Remove diacritics from a string by decomposing it and then removing
	// non-ascii characters
	var _normalize = function (str, both) {
		if (typeof str !== 'string') {
			return str;
		}
	
		// It is faster to just run `normalize` than it is to check if
		// we need to with a regex! (Check as it isn't available in old
		// Safari)
		var res = str.normalize
			? str.normalize("NFD")
			: str;
	
		// Equally, here we check if a regex is needed or not
		return res.length !== str.length
			? (both === true ? str + ' ' : '' ) + res.replace(/[\u0300-\u036f]/g, "")
			: res;
	}
	
	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function ( src ) {
		if ( src.length < 2 ) {
			return true;
		}
	
		var sorted = src.slice().sort();
		var last = sorted[0];
	
		for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
			if ( sorted[i] === last ) {
				return false;
			}
	
			last = sorted[i];
		}
	
		return true;
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		if (Array.from && Set) {
			return Array.from(new Set(src));
		}
	
		if ( _areAllUnique( src ) ) {
			return src.slice();
		}
	
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.app/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i=0 ; i<val.length ; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}
	
		return out;
	}
	
	// Similar to jQuery's addClass, but use classList.add
	function _addClass(el, name) {
		if (name) {
			name.split(' ').forEach(function (n) {
				if (n) {
					// `add` does deduplication, so no need to check `contains`
					el.classList.add(n);
				}
			});
		}
	}
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Return a string with diacritic characters decomposed
		 * @param {*} mixed Function or string to normalize
		 * @param {*} both Return original string and the normalized string
		 * @returns String or undefined
		 */
		diacritics: function (mixed, both) {
			var type = typeof mixed;
	
			if (type !== 'function') {
				return _normalize(mixed, both);
			}
			_normalize = mixed;
		},
	
		/**
		 * Debounce a function
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		debounce: function ( fn, timeout ) {
			var timer;
	
			return function () {
				var that = this;
				var args = arguments;
	
				clearTimeout(timer);
	
				timer = setTimeout( function () {
					fn.apply(that, args);
				}, timeout || 250 );
			};
		},
	
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function ( fn, freq ) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;
	
			return function () {
				var
					that = this,
					now  = +new Date(),
					args = arguments;
	
				if ( last && now < last + frequency ) {
					clearTimeout( timer );
	
					timer = setTimeout( function () {
						last = undefined;
						fn.apply( that, args );
					}, frequency );
				}
				else {
					last = now;
					fn.apply( that, args );
				}
			};
		},
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function ( val ) {
			return val.replace( _re_escape_regex, '\\$1' );
		},
	
		/**
		 * Create a function that will write to a nested object or array
		 * @param {*} source JSON notation string
		 * @returns Write function
		 */
		set: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return DataTable.util.set( source._ );
			}
			else if ( source === null ) {
				// Nothing to do when the data source is null
				return function () {};
			}
			else if ( typeof source === 'function' ) {
				return function (data, val, meta) {
					source( data, 'set', val, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				// Like the get, we need to get data from a nested object
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation( src ), b;
					var aLast = a[a.length-1];
					var arrayNotation, funcNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ ) {
						// Protect against prototype pollution
						if (a[i] === '__proto__' || a[i] === 'constructor') {
							throw new Error('Cannot set prototype values');
						}
		
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
		
						if ( arrayNotation ) {
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
		
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							if ( Array.isArray( val ) ) {
								for ( var j=0, jLen=val.length ; j<jLen ; j++ ) {
									o = {};
									setData( o, val[j], innerSrc );
									data[ a[i] ].push( o );
								}
							}
							else {
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[ a[i] ] = val;
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if ( funcNotation ) {
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]( val );
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined ) {
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// Last item in the input - i.e, the actual set
					if ( aLast.match(__reFn ) ) {
						// Function call
						data = data[ aLast.replace(__reFn, '') ]( val );
					}
					else {
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[ aLast.replace(__reArray, '') ] = val;
					}
				};
		
				return function (data, val) { // meta is also passed in, but not used
					return setData( data, val, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data, val) { // meta is also passed in, but not used
					data[source] = val;
				};
			}
		},
	
		/**
		 * Create a function that will read nested objects from arrays, based on JSON notation
		 * @param {*} source JSON notation string
		 * @returns Value read
		 */
		get: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				// Build an object of get functions, and wrap them in a single call
				var o = {};
				$.each( source, function (key, val) {
					if ( val ) {
						o[key] = DataTable.util.get( val );
					}
				} );
		
				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if ( source === null ) {
				// Give an empty string for rendering / sorting etc
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if ( typeof source === 'function' ) {
				return function (data, type, row, meta) {
					return source( data, type, row, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;
		
					if ( src !== "" ) {
						var a = _fnSplitObjNotation( src );
		
						for ( var i=0, iLen=a.length ; i<iLen ; i++ ) {
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);
		
							if ( arrayNotation ) {
								// Array notation
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
		
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								if ( Array.isArray( data ) ) {
									for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
										out.push( fetchData( data[j], type, innerSrc ) );
									}
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if ( funcNotation ) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[ a[i] ]();
								continue;
							}
		
							if (data === null || data[ a[i] ] === null) {
								return null;
							}
							else if ( data === undefined || data[ a[i] ] === undefined ) {
								return undefined;
							}
	
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) { // row and meta also passed, but not used
					return fetchData( data, type, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data) { // row and meta also passed, but not used
					return data[source];
				};
			}
		},
	
		stripHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_stripHtml = mixed;
				return;
			}
			else if (type === 'string') {
				return _stripHtml(mixed);
			}
			return mixed;
		},
	
		escapeHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_escapeHtml = mixed;
				return;
			}
			else if (type === 'string' || Array.isArray(mixed)) {
				return _escapeHtml(mixed);
			}
			return mixed;
		},
	
		unique: _unique
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Boolean initialisation of x-scrolling
		if ( typeof init.sScrollX === 'boolean' ) {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if ( typeof init.scrollX === 'boolean' ) {
			init.scrollX = init.scrollX ? '100%' : '';
		}
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	
		// Enable search delay if server-side processing is enabled
		if (init.serverSide && ! init.searchDelay) {
			init.searchDelay = 400;
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	
		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if ( typeof dataSort === 'number' && ! Array.isArray( dataSort ) ) {
			init.aDataSort = [ dataSort ];
		}
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if ( ! DataTable.__browser ) {
			var browser = {};
			DataTable.__browser = browser;
	
			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css( {
					position: 'fixed',
					top: 0,
					left: -1 * window.pageXOffset, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				} )
				.append(
					$('<div/>')
						.css( {
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						} )
						.append(
							$('<div/>')
								.css( {
									width: '100%',
									height: 10
								} )
						)
				)
				.appendTo( 'body' );
	
			var outer = n.children();
			var inner = outer.children();
	
			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
	
			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
	
			n.remove();
		}
	
		$.extend( settings.oBrowser, DataTable.__browser );
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol,
			searchFixed: {},
			colEl: $('<col>').attr('data-dt-column', iCol)
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions, true );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
		
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
	
			var origClass = oCol.sClass;
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			// Merge class from previously defined classes with this one, rather than just
			// overwriting it in the extend above
			if (origClass !== oCol.sClass) {
				oCol.sClass = origClass + ' ' + oCol.sClass;
			}
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( oOptions.iDataSort !== undefined )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
	
		// The `render` option can be given as an array to access the helper rendering methods.
		// The first element is the rendering method to use, the rest are the parameters to pass
		if ( oCol.mRender && Array.isArray( oCol.mRender ) ) {
			var copy = oCol.mRender.slice();
			var name = copy.shift();
	
			oCol.mRender = DataTable.render[name].apply(window, copy);
		}
	
		oCol._render = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return oCol._render && type ?
				oCol._render( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' && ! oCol._isArrayHost ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		_fnCalculateColumnWidths( settings );
		_fnColumnSizes( settings );
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '') {
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	/**
	 * Apply column sizes
	 *
	 * @param {*} settings DataTables settings object
	 */
	function _fnColumnSizes ( settings )
	{
		var cols = settings.aoColumns;
	
		for (var i=0 ; i<cols.length ; i++) {
			var width = _fnColumnsSumWidth(settings, [i], false, false);
	
			cols[i].colEl.css('width', width);
	
			if (settings.oScroll.sX) {
				cols[i].colEl.css('min-width', width);
			}
		}
	}
	
	
	/**
	 * Convert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Convert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = aiVis.indexOf(iMatch);
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( settings )
	{
		var layout = settings.aoHeader;
		var columns = settings.aoColumns;
		var vis = 0;
	
		if ( layout.length ) {
			for ( var i=0, ien=layout[0].length ; i<ien ; i++ ) {
				if ( columns[i].bVisible && $(layout[0][i].cell).css('display') !== 'none' ) {
					vis++;
				}
			}
		}
	
		return vis;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		oSettings.aoColumns.map( function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	/**
	 * Allow the result from a type detection function to be `true` while
	 * translating that into a string. Old type detection functions will
	 * return the type name if it passes. An obect store would be better,
	 * but not backwards compatible.
	 *
	 * @param {*} typeDetect Object or function for type detection
	 * @param {*} res Result from the type detection function
	 * @returns Type name or false
	 */
	function _typeResult (typeDetect, res) {
		return res === true
			? typeDetect._name
			: res;
	}
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, detectedType, cache;
	
		// For each column, spin over the data type detection functions, seeing if one matches
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				// With SSP type detection can be unreliable and error prone, so we provide a way
				// to turn it off.
				if (! settings.typeDetect) {
					return;
				}
	
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					var typeDetect = types[j];
	
					// There can be either one, or three type detection functions
					var oneOf = typeDetect.oneOf;
					var allOf = typeDetect.allOf || typeDetect;
					var init = typeDetect.init;
					var one = false;
	
					detectedType = null;
	
					// Fast detect based on column assignment
					if (init) {
						detectedType = _typeResult(typeDetect, init(settings, col, i));
	
						if (detectedType) {
							col.sType = detectedType;
							break;
						}
					}
	
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
						if (! data[k]) {
							continue;
						}
	
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						// Only one data point in the column needs to match this function
						if (oneOf && ! one) {
							one = _typeResult(typeDetect, oneOf( cache[k], settings ));
						}
	
						// All data points need to match this function
						detectedType = _typeResult(typeDetect, allOf( cache[k], settings ));
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-3 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if ( detectedType === 'html' && ! _empty(cache[k]) ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( (oneOf && one && detectedType) || (!oneOf && detectedType) ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
	
			// Set class names for header / footer for auto type classes
			var autoClass = _ext.type.className[col.sType];
	
			if (autoClass) {
				_columnAutoClass(settings.aoHeader, i, autoClass);
				_columnAutoClass(settings.aoFooter, i, autoClass);
			}
	
			var renderer = _ext.type.render[col.sType];
	
			// This can only happen once! There is no way to remove
			// a renderer. After the first time the renderer has
			// already been set so createTr will run the renderer itself.
			if (renderer && ! col._render) {
				col._render = DataTable.util.get(renderer);
	
				_columnAutoRender(settings, i);
			}
		}
	}
	
	/**
	 * Apply an auto detected renderer to data which doesn't yet have
	 * a renderer
	 */
	function _columnAutoRender(settings, colIdx) {
		var data = settings.aoData;
	
		for (var i=0 ; i<data.length ; i++) {
			if (data[i].nTr) {
				// We have to update the display here since there is no
				// invalidation check for the data
				var display = _fnGetCellData( settings, i, colIdx, 'display' );
	
				data[i].displayData[colIdx] = display;
				_fnWriteCell(data[i].anCells[colIdx], display);
	
				// No need to update sort / filter data since it has
				// been invalidated and will be re-read with the
				// renderer now applied
			}
		}
	}
	
	/**
	 * Apply a class name to a column's header cells
	 */
	function _columnAutoClass(container, colIdx, className) {
		container.forEach(function (row) {
			if (row[colIdx] && row[colIdx].unique) {
				_addClass(row[colIdx].cell, className);
			}
		});
	}
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {array} headerLayout Layout for header as it was loaded
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, headerLayout, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				if (aoCols[i] && aoCols[i].name) {
					columns[i].sName = aoCols[i].name;
				}
			}
		}
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.target !== undefined
					? def.target
					: def.targets !== undefined
						? def.targets
						: def.aTargets;
	
				if ( ! Array.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					var target = aTargets[j];
	
					if ( typeof target === 'number' && target >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= target )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( target, def );
					}
					else if ( typeof target === 'number' && target < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+target, def );
					}
					else if ( typeof target === 'string' )
					{
						for ( k=0, kLen=columns.length ; k<kLen ; k++ ) {
							if (target === '_all') {
								// Apply to all columns
								fn( k, def );
							}
							else if (target.indexOf(':name') !== -1) {
								// Column selector
								if (columns[k].sName === target.replace(':name', '')) {
									fn( k, def );
								}
							}
							else {
								// Cell selector
								headerLayout.forEach(function (row) {
									if (row[k]) {
										var cell = $(row[k].cell);
	
										// Legacy support. Note that it means that we don't support
										// an element name selector only, since they are treated as
										// class names for 1.x compat.
										if (target.match(/^[a-z][\w-]*$/i)) {
											target = '.' + target;
										}
	
										if (cell.is( target )) {
											fn( k, def );
										}
									}
								});
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				fn( i, aoCols[i] );
			}
		}
	}
	
	
	/**
	 * Get the width for a given set of columns
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} targets Columns - comma separated string or array of numbers
	 * @param {*} original Use the original width (true) or calculated (false)
	 * @param {*} incVisible Include visible columns (true) or not (false)
	 * @returns Combined CSS value
	 */
	function _fnColumnsSumWidth( settings, targets, original, incVisible ) {
		if ( ! Array.isArray( targets ) ) {
			targets = _fnColumnsFromHeader( targets );
		}
	
		var sum = 0;
		var unit;
		var columns = settings.aoColumns;
		
		for ( var i=0, ien=targets.length ; i<ien ; i++ ) {
			var column = columns[ targets[i] ];
			var definedWidth = original ?
				column.sWidthOrig :
				column.sWidth;
	
			if ( ! incVisible && column.bVisible === false ) {
				continue;
			}
	
			if ( definedWidth === null || definedWidth === undefined ) {
				return null; // can't determine a defined width - browser defined
			}
			else if ( typeof definedWidth === 'number' ) {
				unit = 'px';
				sum += definedWidth;
			}
			else {
				var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);
	
				if ( matched ) {
					sum += matched[1] * 1;
					unit = matched.length === 3 ?
						matched[2] :
						'px';
				}
			}
		}
	
		return sum + unit;
	}
	
	function _fnColumnsFromHeader( cell )
	{
		var attr = $(cell).closest('[data-dt-column]').attr('data-dt-column');
	
		if ( ! attr ) {
			return [];
		}
	
		return attr.split(',').map( function (val) {
			return val * 1;
		} );
	}
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} settings dataTables settings object
	 *  @param {array} data data array to be added
	 *  @param {node} [tr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [tds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( settings, dataIn, tr, tds )
	{
		/* Create the object for storing information about this new row */
		var rowIdx = settings.aoData.length;
		var rowModel = $.extend( true, {}, DataTable.models.oRow, {
			src: tr ? 'dom' : 'data',
			idx: rowIdx
		} );
	
		rowModel._aData = dataIn;
		settings.aoData.push( rowModel );
	
		var columns = settings.aoColumns;
	
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			// Invalidate the column types as the new data needs to be revalidated
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		settings.aiDisplayMaster.push( rowIdx );
	
		var id = settings.rowIdFn( dataIn );
		if ( id !== undefined ) {
			settings.aIds[ id ] = rowModel;
		}
	
		/* Create the DOM information, or register it if already present */
		if ( tr || ! settings.oFeatures.bDeferRender )
		{
			_fnCreateTr( settings, rowIdx, tr, tds );
		}
	
		return rowIdx;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		if (type === 'search') {
			type = 'filter';
		}
		else if (type === 'order') {
			type = 'sort';
		}
	
		var row = settings.aoData[rowIdx];
	
		if (! row) {
			return undefined;
		}
	
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = row._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		// Allow for a node being returned for non-display types
		if (type !== 'display' && cellData && typeof cellData === 'object' && cellData.nodeName) {
			cellData = cellData.innerHTML;
		}
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx+", column "+colIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type === 'display' ) {
			return '';
		}
	
		if ( type === 'filter' ) {
			var fomatters = DataTable.ext.type.search;
	
			if ( fomatters[ col.sType ] ) {
				cellData = fomatters[ col.sType ]( cellData );
			}
		}
	
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	/**
	 * Write a value to a cell
	 * @param {*} td Cell
	 * @param {*} val Value
	 */
	function _fnWriteCell(td, val)
	{
		if (val && typeof val === 'object' && val.nodeName) {
			$(td)
				.empty()
				.append(val);
		}
		else {
			td.innerHTML = val;
		}
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		var parts = str.match(/(\\.|[^.])+/g) || [''];
	
		return parts.map( function ( s ) {
			return s.replace(/\\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	var _fnGetObjectDataFn = DataTable.util.get;
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	var _fnSetObjectDataFn = DataTable.util.set;
	
	
	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster ( settings )
	{
		return _pluck( settings.aoData, '_aData' );
	}
	
	
	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable( settings )
	{
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}
	
	
	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate( settings, rowIdx, src, colIdx )
	{
		var row = settings.aoData[ rowIdx ];
		var i, ien;
	
		// Remove the cached data for the row
		row._aSortData = null;
		row._aFilterData = null;
		row.displayData = null;
	
		// Are we reading last data from DOM or the data object?
		if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
			var display = _fnGetRowDisplay(settings, rowIdx);
	
			if ( cells ) {
				if ( colIdx !== undefined ) {
					_fnWriteCell(cells[colIdx], display[colIdx]);
				}
				else {
					for ( i=0, ien=cells.length ; i<ien ; i++ ) {
						_fnWriteCell(cells[i], display[i]);
					}
				}
			}
		}
	
		// Column specific invalidation
		var cols = settings.aoColumns;
		if ( colIdx !== undefined ) {
			// Type - the data might have changed
			cols[ colIdx ].sType = null;
	
			// Max length string. Its a fairly cheep recalculation, so not worth
			// something more complicated
			cols[ colIdx ].maxLenString = null;
		}
		else {
			for ( i=0, ien=cols.length ; i<ien ; i++ ) {
				cols[i].sType = null;
				cols[i].maxLenString = null;
			}
	
			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes( settings, row );
		}
	}
	
	
	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements( settings, row, colIdx, d )
	{
		var
			tds = [],
			td = row.firstChild,
			name, col, i=0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;
	
		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];
	
		var attr = function ( str, td  ) {
			if ( typeof str === 'string' ) {
				var idx = str.indexOf('@');
	
				if ( idx !== -1 ) {
					var attr = str.substring( idx+1 );
					var setter = _fnSetObjectDataFn( str );
					setter( d, td.getAttribute( attr ) );
				}
			}
		};
	
		// Read data from a cell and store into the data object
		var cellProcess = function ( cell ) {
			if ( colIdx === undefined || colIdx === i ) {
				col = columns[i];
				contents = (cell.innerHTML).trim();
	
				if ( col && col._bAttrSrc ) {
					var setter = _fnSetObjectDataFn( col.mData._ );
					setter( d, contents );
	
					attr( col.mData.sort, cell );
					attr( col.mData.type, cell );
					attr( col.mData.filter, cell );
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if ( objectRead ) {
						if ( ! col._setter ) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn( col.mData );
						}
						col._setter( d, contents );
					}
					else {
						d[i] = contents;
					}
				}
			}
	
			i++;
		};
	
		if ( td ) {
			// `tr` element was passed in
			while ( td ) {
				name = td.nodeName.toUpperCase();
	
				if ( name == "TD" || name == "TH" ) {
					cellProcess( td );
					tds.push( td );
				}
	
				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;
	
			for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
				cellProcess( tds[j] );
			}
		}
	
		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;
	
		if ( rowNode ) {
			var id = rowNode.getAttribute( 'id' );
	
			if ( id ) {
				_fnSetObjectDataFn( settings.rowId )( d, id );
			}
		}
	
		return {
			data: d,
			cells: tds
		};
	}
	
	/**
	 * Render and cache a row's display data for the columns, if required
	 * @returns 
	 */
	function _fnGetRowDisplay (settings, rowIdx) {
		var rowModal = settings.aoData[rowIdx];
		var columns = settings.aoColumns;
	
		if (! rowModal.displayData) {
			// Need to render and cache
			rowModal.displayData = [];
		
			for ( var colIdx=0, len=columns.length ; colIdx<len ; colIdx++ ) {
				rowModal.displayData.push(
					_fnGetCellData( settings, rowIdx, colIdx, 'display' )
				);
			}
		}
	
		return rowModal.displayData;
	}
	
	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
	{
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create,
			trClass = oSettings.oClasses.tbody.row;
	
		if ( row.nTr === null )
		{
			nTr = nTrIn || document.createElement('tr');
	
			row.nTr = nTr;
			row.anCells = cells;
	
			_addClass(nTr, trClass);
	
			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;
	
			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes( oSettings, row );
	
			/* Process each column */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
				create = nTrIn && anTds[i] ? false : true;
	
				nTd = create ? document.createElement( oCol.sCellType ) : anTds[i];
	
				if (! nTd) {
					_fnLog( oSettings, 0, 'Incorrect column count', 18 );
				}
	
				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};
				
				cells.push( nTd );
				
				var display = _fnGetRowDisplay(oSettings, iRow);
	
				// Need to create the HTML if new, or if a rendering function is defined
				if (
					create ||
					(
						(oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
					)
				) {
					_fnWriteCell(nTd, display[i]);
				}
	
				// column class
				_addClass(nTd, oCol.sClass);
	
				// Visibility - add or remove as required
				if ( oCol.bVisible && create )
				{
					nTr.appendChild( nTd );
				}
				else if ( ! oCol.bVisible && ! create )
				{
					nTd.parentNode.removeChild( nTd );
				}
	
				if ( oCol.fnCreatedCell )
				{
					oCol.fnCreatedCell.call( oSettings.oInstance,
						nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
					);
				}
			}
	
			_fnCallbackFire( oSettings, 'aoRowCreatedCallback', 'row-created', [nTr, rowData, iRow, cells] );
		}
		else {
			_addClass(row.nTr, trClass);
		}
	}
	
	
	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes( settings, row )
	{
		var tr = row.nTr;
		var data = row._aData;
	
		if ( tr ) {
			var id = settings.rowIdFn( data );
	
			if ( id ) {
				tr.id = id;
			}
	
			if ( data.DT_RowClass ) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique( row.__rowc.concat( a ) ) :
					a;
	
				$(tr)
					.removeClass( row.__rowc.join(' ') )
					.addClass( data.DT_RowClass );
			}
	
			if ( data.DT_RowAttr ) {
				$(tr).attr( data.DT_RowAttr );
			}
	
			if ( data.DT_RowData ) {
				$(tr).data( data.DT_RowData );
			}
		}
	}
	
	
	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead( settings, side )
	{
		var classes = settings.oClasses;
		var columns = settings.aoColumns;
		var i, ien, row;
		var target = side === 'header'
			? settings.nTHead
			: settings.nTFoot;
		var titleProp = side === 'header' ? 'sTitle' : side;
	
		// Footer might be defined
		if (! target) {
			return;
		}
	
		// If no cells yet and we have content for them, then create
		if (side === 'header' || _pluck(settings.aoColumns, titleProp).join('')) {
			row = $('tr', target);
	
			// Add a row if needed
			if (! row.length) {
				row = $('<tr/>').appendTo(target)
			}
	
			// Add the number of cells needed to make up to the number of columns
			if (row.length === 1) {
				var cellCount = 0;
				
				$('td, th', row).each(function () {
					cellCount += this.colSpan;
				});
	
				for ( i=cellCount, ien=columns.length ; i<ien ; i++ ) {
					$('<th/>')
						.html( columns[i][titleProp] || '' )
						.appendTo( row );
				}
			}
		}
	
		var detected = _fnDetectHeader( settings, target, true );
	
		if (side === 'header') {
			settings.aoHeader = detected;
			$('tr', target).addClass(classes.thead.row);
		}
		else {
			settings.aoFooter = detected;
			$('tr', target).addClass(classes.tfoot.row);
		}
	
		// Every cell needs to be passed through the renderer
		$(target).children('tr').children('th, td')
			.each( function () {
				_fnRenderer( settings, side )(
					settings, $(this), classes
				);
			} );
	}
	
	/**
	 * Build a layout structure for a header or footer
	 *
	 * @param {*} settings DataTables settings
	 * @param {*} source Source layout array
	 * @param {*} incColumns What columns should be included
	 * @returns Layout array
	 */
	function _fnHeaderLayout( settings, source, incColumns )
	{
		var row, column, cell;
		var local = [];
		var structure = [];
		var columns = settings.aoColumns;
		var columnCount = columns.length;
		var rowspan, colspan;
	
		if ( ! source ) {
			return;
		}
	
		// Default is to work on only visible columns
		if ( ! incColumns ) {
			incColumns = _range(columnCount)
				.filter(function (idx) {
					return columns[idx].bVisible;
				});
		}
	
		// Make a copy of the master layout array, but with only the columns we want
		for ( row=0 ; row<source.length ; row++ ) {
			// Remove any columns we haven't selected
			local[row] = source[row].slice().filter(function (cell, i) {
				return incColumns.includes(i);
			});
	
			// Prep the structure array - it needs an element for each row
			structure.push( [] );
		}
	
		for ( row=0 ; row<local.length ; row++ ) {
			for ( column=0 ; column<local[row].length ; column++ ) {
				rowspan = 1;
				colspan = 1;
	
				// Check to see if there is already a cell (row/colspan) covering our target
				// insert point. If there is, then there is nothing to do.
				if ( structure[row][column] === undefined ) {
					cell = local[row][column].cell;
	
					// Expand for rowspan
					while (
						local[row+rowspan] !== undefined &&
						local[row][column].cell == local[row+rowspan][column].cell
					) {
						structure[row+rowspan][column] = null;
						rowspan++;
					}
	
					// And for colspan
					while (
						local[row][column+colspan] !== undefined &&
						local[row][column].cell == local[row][column+colspan].cell
					) {
						// Which also needs to go over rows
						for ( var k=0 ; k<rowspan ; k++ ) {
							structure[row+k][column+colspan] = null;
						}
	
						colspan++;
					}
	
					var titleSpan = $('span.dt-column-title', cell);
	
					structure[row][column] = {
						cell: cell,
						colspan: colspan,
						rowspan: rowspan,
						title: titleSpan.length
							? titleSpan.html()
							: $(cell).html()
					};
				}
			}
		}
	
		return structure;
	}
	
	
	/**
	 * Draw the header (or footer) element based on the column visibility states.
	 *
	 *  @param object oSettings dataTables settings object
	 *  @param array aoSource Layout array from _fnDetectHeader
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead( settings, source )
	{
		var layout = _fnHeaderLayout(settings, source);
		var tr, n;
	
		for ( var row=0 ; row<source.length ; row++ ) {
			tr = source[row].row;
	
			// All cells are going to be replaced, so empty out the row
			// Can't use $().empty() as that kills event handlers
			if (tr) {
				while( (n = tr.firstChild) ) {
					tr.removeChild( n );
				}
			}
	
			for ( var column=0 ; column<layout[row].length ; column++ ) {
				var point = layout[row][column];
	
				if (point) {
					$(point.cell)
						.appendTo(tr)
						.attr('rowspan', point.rowspan)
						.attr('colspan', point.colspan);
				}
			}
		}
	}
	
	
	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw( oSettings, ajaxComplete )
	{
		// Allow for state saving and a custom start position
		_fnStart( oSettings );
	
		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
		if ( aPreDraw.indexOf(false) !== -1 )
		{
			_fnProcessingDisplay( oSettings, false );
			return;
		}
	
		var anRows = [];
		var iRowCount = 0;
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
		var columns = oSettings.aoColumns;
		var body = $(oSettings.nTBody);
	
		oSettings.bDrawing = true;
	
		/* Server-side processing draw intercept */
		if ( oSettings.deferLoading )
		{
			oSettings.deferLoading = false;
			oSettings.iDraw++;
			_fnProcessingDisplay( oSettings, false );
		}
		else if ( !bServerSide )
		{
			oSettings.iDraw++;
		}
		else if ( !oSettings.bDestroying && !ajaxComplete)
		{
			// Show loading message for server-side processing
			if (oSettings.iDraw === 0) {
				body.empty().append(_emptyRow(oSettings));
			}
	
			_fnAjaxUpdate( oSettings );
			return;
		}
	
		if ( aiDisplay.length !== 0 )
		{
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
	
			for ( var j=iStart ; j<iEnd ; j++ )
			{
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[ iDataIndex ];
				if ( aoData.nTr === null )
				{
					_fnCreateTr( oSettings, iDataIndex );
				}
	
				var nRow = aoData.nTr;
	
				// Add various classes as needed
				for (var i=0 ; i<columns.length ; i++) {
					var col = columns[i];
					var td = aoData.anCells[i];
	
					_addClass(td, _ext.type.className[col.sType]); // auto class
					_addClass(td, oSettings.oClasses.tbody.cell); // all cells
				}
	
				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire( oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex] );
	
				anRows.push( nRow );
				iRowCount++;
			}
		}
		else
		{
			anRows[ 0 ] = _emptyRow(oSettings);
		}
	
		/* Header and footer callbacks */
		_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		// replaceChildren is faster, but only became widespread in 2020,
		// so a fall back in jQuery is provided for older browsers.
		if (body[0].replaceChildren) {
			body[0].replaceChildren.apply(body[0], anRows);
		}
		else {
			body.children().detach();
			body.append( $(anRows) );
		}
	
		// Empty table needs a specific class
		$(oSettings.nTableWrapper).toggleClass('dt-empty-footer', $('tr', oSettings.nTFoot).length === 0);
	
		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings], true );
	
		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}
	
	
	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw( settings, holdPosition, recompute )
	{
		var
			features = settings.oFeatures,
			sort     = features.bSort,
			filter   = features.bFilter;
	
		if (recompute === undefined || recompute === true) {
			// Resolve any column types that are unknown due to addition or invalidation
			_fnColumnTypes( settings );
	
			if ( sort ) {
				_fnSort( settings );
			}
	
			if ( filter ) {
				_fnFilterComplete( settings, settings.oPreviousSearch );
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		}
	
		if ( holdPosition !== true ) {
			settings._iDisplayStart = 0;
		}
	
		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;
	
		_fnDraw( settings );
	
		settings._drawHold = false;
	}
	
	
	/*
	 * Table is empty - create a row with an empty message in it
	 */
	function _emptyRow ( settings ) {
		var oLang = settings.oLanguage;
		var zero = oLang.sZeroRecords;
		var dataSrc = _fnDataSource( settings );
	
		if (
			(settings.iDraw < 1 && dataSrc === 'ssp') ||
			(settings.iDraw <= 1 && dataSrc === 'ajax')
		) {
			zero = oLang.sLoadingRecords;
		}
		else if ( oLang.sEmptyTable && settings.fnRecordsTotal() === 0 )
		{
			zero = oLang.sEmptyTable;
		}
	
		return $( '<tr/>' )
			.append( $('<td />', {
				'colSpan': _fnVisbleColumns( settings ),
				'class':   settings.oClasses.empty.row
			} ).html( zero ) )[0];
	}
	
	
	/**
	 * Expand the layout items into an object for the rendering function
	 */
	function _layoutItems (row, align, items) {
		if ( Array.isArray(items)) {
			for (var i=0 ; i<items.length ; i++) {
				_layoutItems(row, align, items[i]);
			}
	
			return;
		}
	
		var rowCell = row[align];
	
		// If it is an object, then there can be multiple features contained in it
		if ( $.isPlainObject( items ) ) {
			// A feature plugin cannot be named "features" due to this check
			if (items.features) {
				if (items.rowId) {
					row.id = items.rowId;
				}
				if (items.rowClass) {
					row.className = items.rowClass;
				}
	
				rowCell.id = items.id;
				rowCell.className = items.className;
	
				_layoutItems(row, align, items.features);
			}
			else {
				Object.keys(items).map(function (key) {
					rowCell.contents.push( {
						feature: key,
						opts: items[key]
					});
				});
			}
		}
		else {
			rowCell.contents.push(items);
		}
	}
	
	/**
	 * Find, or create a layout row
	 */
	function _layoutGetRow(rows, rowNum, align) {
		var row;
	
		// Find existing rows
		for (var i=0; i<rows.length; i++) {
			row = rows[i];
	
			if (row.rowNum === rowNum) {
				// full is on its own, but start and end share a row
				if (
					(align === 'full' && row.full) ||
					((align === 'start' || align === 'end') && (row.start || row.end))
				) {
					if (! row[align]) {
						row[align] = {
							contents: []
						};
					}
	
					return row;
				}
			}
		}
	
		// If we get this far, then there was no match, create a new row
		row = {
			rowNum: rowNum	
		};
	
		row[align] = {
			contents: []
		};
	
		rows.push(row);
	
		return row;
	}
	
	/**
	 * Convert a `layout` object given by a user to the object structure needed
	 * for the renderer. This is done twice, once for above and once for below
	 * the table. Ordering must also be considered.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} layout Layout object to convert
	 * @param {string} side `top` or `bottom`
	 * @returns Converted array structure - one item for each row.
	 */
	function _layoutArray ( settings, layout, side ) {
		var rows = [];
		
		// Split out into an array
		$.each( layout, function ( pos, items ) {
			if (items === null) {
				return;
			}
	
			var parts = pos.match(/^([a-z]+)([0-9]*)([A-Za-z]*)$/);
			var rowNum = parts[2]
				? parts[2] * 1
				: 0;
			var align = parts[3]
				? parts[3].toLowerCase()
				: 'full';
	
			// Filter out the side we aren't interested in
			if (parts[1] !== side) {
				return;
			}
	
			// Get or create the row we should attach to
			var row = _layoutGetRow(rows, rowNum, align);
	
			_layoutItems(row, align, items);
		});
	
		// Order by item identifier
		rows.sort( function ( a, b ) {
			var order1 = a.rowNum;
			var order2 = b.rowNum;
	
			// If both in the same row, then the row with `full` comes first
			if (order1 === order2) {
				var ret = a.full && ! b.full ? -1 : 1;
	
				return side === 'bottom'
					? ret * -1
					: ret;
			}
	
			return order2 - order1;
		} );
	
		// Invert for below the table
		if ( side === 'bottom' ) {
			rows.reverse();
		}
	
		for (var row = 0; row<rows.length; row++) {
			delete rows[row].rowNum;
	
			_layoutResolve(settings, rows[row]);
		}
	
		return rows;
	}
	
	
	/**
	 * Convert the contents of a row's layout object to nodes that can be inserted
	 * into the document by a renderer. Execute functions, look up plug-ins, etc.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} row Layout object for this row
	 */
	function _layoutResolve( settings, row ) {
		var getFeature = function (feature, opts) {
			if ( ! _ext.features[ feature ] ) {
				_fnLog( settings, 0, 'Unknown feature: '+ feature );
			}
	
			return _ext.features[ feature ].apply( this, [settings, opts] );
		};
	
		var resolve = function ( item ) {
			if (! row[ item ]) {
				return;
			}
	
			var line = row[ item ].contents;
	
			for ( var i=0, ien=line.length ; i<ien ; i++ ) {
				if ( ! line[i] ) {
					continue;
				}
				else if ( typeof line[i] === 'string' ) {
					line[i] = getFeature( line[i], null );
				}
				else if ( $.isPlainObject(line[i]) ) {
					// If it's an object, it just has feature and opts properties from
					// the transform in _layoutArray
					line[i] = getFeature(line[i].feature, line[i].opts);
				}
				else if ( typeof line[i].node === 'function' ) {
					line[i] = line[i].node( settings );
				}
				else if ( typeof line[i] === 'function' ) {
					var inst = line[i]( settings );
	
					line[i] = typeof inst.node === 'function' ?
						inst.node() :
						inst;
				}
			}
		};
	
		resolve('start');
		resolve('end');
		resolve('full');
	}
	
	
	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} settings DataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml ( settings )
	{
		var classes = settings.oClasses;
		var table = $(settings.nTable);
	
		// Wrapper div around everything DataTables controls
		var insert = $('<div/>')
			.attr({
				id:      settings.sTableId+'_wrapper',
				'class': classes.container
			})
			.insertBefore(table);
	
		settings.nTableWrapper = insert[0];
	
		if (settings.sDom) {
			// Legacy
			_fnLayoutDom(settings, settings.sDom, insert);
		}
		else {
			var top = _layoutArray( settings, settings.layout, 'top' );
			var bottom = _layoutArray( settings, settings.layout, 'bottom' );
			var renderer = _fnRenderer( settings, 'layout' );
		
			// Everything above - the renderer will actually insert the contents into the document
			top.forEach(function (item) {
				renderer( settings, insert, item );
			});
	
			// The table - always the center of attention
			renderer( settings, insert, {
				full: {
					table: true,
					contents: [ _fnFeatureHtmlTable(settings) ]
				}
			} );
	
			// Everything below
			bottom.forEach(function (item) {
				renderer( settings, insert, item );
			});
		}
	
		// Processing floats on top, so it isn't an inserted feature
		_processingHtml( settings );
	}
	
	/**
	 * Draw the table with the legacy DOM property
	 * @param {*} settings DT settings object
	 * @param {*} dom DOM string
	 * @param {*} insert Insert point
	 */
	function _fnLayoutDom( settings, dom, insert )
	{
		var parts = dom.match(/(".*?")|('.*?')|./g);
		var featureNode, option, newNode, next, attr;
	
		for ( var i=0 ; i<parts.length ; i++ ) {
			featureNode = null;
			option = parts[i];
	
			if ( option == '<' ) {
				// New container div
				newNode = $('<div/>');
	
				// Check to see if we should append an id and/or a class name to the container
				next = parts[i+1];
	
				if ( next[0] == "'" || next[0] == '"' ) {
					attr = next.replace(/['"]/g, '');
	
					var id = '', className;
	
					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if ( attr.indexOf('.') != -1 ) {
						var split = attr.split('.');
	
						id = split[0];
						className = split[1];
					}
					else if ( attr[0] == "#" ) {
						id = attr;
					}
					else {
						className = attr;
					}
	
					newNode
						.attr('id', id.substring(1))
						.addClass(className);
	
					i++; // Move along the position array
				}
	
				insert.append( newNode );
				insert = newNode;
			}
			else if ( option == '>' ) {
				// End container div
				insert = insert.parent();
			}
			else if ( option == 't' ) {
				// Table
				featureNode = _fnFeatureHtmlTable( settings );
			}
			else
			{
				DataTable.ext.feature.forEach(function(feature) {
					if ( option == feature.cFeature ) {
						featureNode = feature.fnInit( settings );
					}
				});
			}
	
			// Add to the display
			if ( featureNode ) {
				insert.append( featureNode );
			}
		}
	}
	
	
	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param {node} thead The header/footer element for the table
	 *  @returns {array} Calculated layout array
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader ( settings, thead, write )
	{
		var columns = settings.aoColumns;
		var rows = $(thead).children('tr');
		var row, cell;
		var i, k, l, iLen, shifted, column, colspan, rowspan;
		var isHeader = thead && thead.nodeName.toLowerCase() === 'thead';
		var layout = [];
		var unique;
		var shift = function ( a, i, j ) {
			var k = a[i];
			while ( k[j] ) {
				j++;
			}
			return j;
		};
	
		// We know how many rows there are in the layout - so prep it
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			layout.push( [] );
		}
	
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			row = rows[i];
			column = 0;
	
			// For every cell in the row..
			cell = row.firstChild;
			while ( cell ) {
				if (
					cell.nodeName.toUpperCase() == 'TD' ||
					cell.nodeName.toUpperCase() == 'TH'
				) {
					var cols = [];
	
					// Get the col and rowspan attributes from the DOM and sanitise them
					colspan = cell.getAttribute('colspan') * 1;
					rowspan = cell.getAttribute('rowspan') * 1;
					colspan = (!colspan || colspan===0 || colspan===1) ? 1 : colspan;
					rowspan = (!rowspan || rowspan===0 || rowspan===1) ? 1 : rowspan;
	
					// There might be colspan cells already in this row, so shift our target
					// accordingly
					shifted = shift( layout, i, column );
	
					// Cache calculation for unique columns
					unique = colspan === 1 ?
						true :
						false;
					
					// Perform header setup
					if ( write ) {
						if (unique) {
							// Allow column options to be set from HTML attributes
							_fnColumnOptions( settings, shifted, $(cell).data() );
							
							// Get the width for the column. This can be defined from the
							// width attribute, style attribute or `columns.width` option
							var columnDef = columns[shifted];
							var width = cell.getAttribute('width') || null;
							var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
							if ( t ) {
								width = t[1];
							}
	
							columnDef.sWidthOrig = columnDef.sWidth || width;
	
							if (isHeader) {
								// Column title handling - can be user set, or read from the DOM
								// This happens before the render, so the original is still in place
								if ( columnDef.sTitle !== null && ! columnDef.autoTitle ) {
									cell.innerHTML = columnDef.sTitle;
								}
	
								if (! columnDef.sTitle && unique) {
									columnDef.sTitle = _stripHtml(cell.innerHTML);
									columnDef.autoTitle = true;
								}
							}
							else {
								// Footer specific operations
								if (columnDef.footer) {
									cell.innerHTML = columnDef.footer;
								}
							}
	
							// Fall back to the aria-label attribute on the table header if no ariaTitle is
							// provided.
							if (! columnDef.ariaTitle) {
								columnDef.ariaTitle = $(cell).attr("aria-label") || columnDef.sTitle;
							}
	
							// Column specific class names
							if ( columnDef.className ) {
								$(cell).addClass( columnDef.className );
							}
						}
	
						// Wrap the column title so we can write to it in future
						if ( $('span.dt-column-title', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-title')
								.append(cell.childNodes)
								.appendTo(cell);
						}
	
						if ( isHeader && $('span.dt-column-order', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-order')
								.appendTo(cell);
						}
					}
	
					// If there is col / rowspan, copy the information into the layout grid
					for ( l=0 ; l<colspan ; l++ ) {
						for ( k=0 ; k<rowspan ; k++ ) {
							layout[i+k][shifted+l] = {
								cell: cell,
								unique: unique
							};
	
							layout[i+k].row = row;
						}
	
						cols.push( shifted+l );
					}
	
					// Assign an attribute so spanning cells can still be identified
					// as belonging to a column
					cell.setAttribute('data-dt-column', _unique(cols).join(','));
				}
	
				cell = cell.nextSibling;
			}
		}
	
		return layout;
	}
	
	/**
	 * Set the start position for draw
	 *  @param {object} oSettings dataTables settings object
	 */
	function _fnStart( oSettings )
	{
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var iInitDisplayStart = oSettings.iInitDisplayStart;
	
		// Check and see if we have an initial draw position from state saving
		if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
		{
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;
	
			oSettings.iInitDisplayStart = -1;
		}
	}
	
	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax( oSettings, data, fn )
	{
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function ( json ) {
			var status = oSettings.jqXHR
				? oSettings.jqXHR.status
				: null;
	
			if ( json === null || (typeof status === 'number' && status == 204 ) ) {
				json = {};
				_fnAjaxDataSrc( oSettings, json, [] );
			}
	
			var error = json.error || json.sError;
			if ( error ) {
				_fnLog( oSettings, 0, error );
			}
	
			// Microsoft often wrap JSON as a string in another JSON object
			// Let's handle that automatically
			if (json.d && typeof json.d === 'string') {
				try {
					json = JSON.parse(json.d);
				}
				catch (e) {
					// noop
				}
			}
	
			oSettings.json = json;
	
			_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR], true );
			fn( json );
		};
	
		if ( $.isPlainObject( ajax ) && ajax.data )
		{
			ajaxData = ajax.data;
	
			var newData = typeof ajaxData === 'function' ?
				ajaxData( data, oSettings ) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge
	
			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend( true, data, newData );
	
			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}
	
		var baseAjax = {
			"url": typeof ajax === 'string' ?
				ajax :
				'',
			"data": data,
			"success": callback,
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error) {
				var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR], true );
	
				if ( ret.indexOf(true) === -1 ) {
					if ( error == "parsererror" ) {
						_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
					}
					else if ( xhr.readyState === 4 ) {
						_fnLog( oSettings, 0, 'Ajax error', 7 );
					}
				}
	
				_fnProcessingDisplay( oSettings, false );
			}
		};
	
		// If `ajax` option is an object, extend and override our default base
		if ( $.isPlainObject( ajax ) ) {
			$.extend( baseAjax, ajax )
		}
	
		// Store the data submitted for the API
		oSettings.oAjaxData = data;
	
		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data, baseAjax], true );
	
		if ( typeof ajax === 'function' )
		{
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
		}
		else if (ajax.url === '') {
			// No url, so don't load any data. Just apply an empty data array
			// to the object for the callback.
			var empty = {};
	
			DataTable.util.set(ajax.dataSrc)(empty, []);
			callback(empty);
		}
		else {
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax( baseAjax );
		}
	
		// Restore for next time around
		if ( ajaxData ) {
			ajax.data = ajaxData;
		}
	}
	
	
	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate( settings )
	{
		settings.iDraw++;
		_fnProcessingDisplay( settings, true );
	
		_fnBuildAjax(
			settings,
			_fnAjaxParameters( settings ),
			function(json) {
				_fnAjaxUpdateDraw( settings, json );
			}
		);
	}
	
	
	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters( settings )
	{
		var
			columns = settings.aoColumns,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			colData = function ( idx, prop ) {
				return typeof columns[idx][prop] === 'function' ?
					'function' :
					columns[idx][prop];
			};
	
		return {
			draw: settings.iDraw,
			columns: columns.map( function ( column, i ) {
				return {
					data: colData(i, 'mData'),
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: preColSearch[i].search,
						regex: preColSearch[i].regex,
						fixed: Object.keys(column.searchFixed).map( function(name) {
							return {
								name: name,
								term: column.searchFixed[name].toString()
							}
						})
					}
				};
			} ),
			order: _fnSortFlatten( settings ).map( function ( val ) {
				return {
					column: val.col,
					dir: val.dir,
					name: colData(val.col, 'sName')
				};
			} ),
			start: settings._iDisplayStart,
			length: features.bPaginate ?
				settings._iDisplayLength :
				-1,
			search: {
				value: preSearch.search,
				regex: preSearch.regex,
				fixed: Object.keys(settings.searchFixed).map( function(name) {
					return {
						name: name,
						term: settings.searchFixed[name].toString()
					}
				})
			}
		};
	}
	
	
	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw ( settings, json )
	{
		var data = _fnAjaxDataSrc(settings, json);
		var draw = _fnAjaxDataSrcParam(settings, 'draw', json);
		var recordsTotal = _fnAjaxDataSrcParam(settings, 'recordsTotal', json);
		var recordsFiltered = _fnAjaxDataSrcParam(settings, 'recordsFiltered', json);
	
		if ( draw !== undefined ) {
			// Protect against out of sequence returns
			if ( draw*1 < settings.iDraw ) {
				return;
			}
			settings.iDraw = draw * 1;
		}
	
		// No data in returned object, so rather than an array, we show an empty table
		if ( ! data ) {
			data = [];
		}
	
		_fnClearTable( settings );
		settings._iRecordsTotal   = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
	
		for ( var i=0, ien=data.length ; i<ien ; i++ ) {
			_fnAddData( settings, data[i] );
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();
	
		_fnColumnTypes(settings);
		_fnDraw( settings, true );
		_fnInitComplete( settings );
		_fnProcessingDisplay( settings, false );
	}
	
	
	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} settings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc ( settings, json, write )
	{
		var dataProp = 'data';
	
		if ($.isPlainObject( settings.ajax ) && settings.ajax.dataSrc !== undefined) {
			// Could in inside a `dataSrc` object, or not!
			var dataSrc = settings.ajax.dataSrc;
	
			// string, function and object are valid types
			if (typeof dataSrc === 'string' || typeof dataSrc === 'function') {
				dataProp = dataSrc;
			}
			else if (dataSrc.data !== undefined) {
				dataProp = dataSrc.data;
			}
		}
	
		if ( ! write ) {
			if ( dataProp === 'data' ) {
				// If the default, then we still want to support the old style, and safely ignore
				// it if possible
				return json.aaData || json[dataProp];
			}
	
			return dataProp !== "" ?
				_fnGetObjectDataFn( dataProp )( json ) :
				json;
		}
		
		// set
		_fnSetObjectDataFn( dataProp )( json, write );
	}
	
	/**
	 * Very similar to _fnAjaxDataSrc, but for the other SSP properties
	 * @param {*} settings DataTables settings object
	 * @param {*} param Target parameter
	 * @param {*} json JSON data
	 * @returns Resolved value
	 */
	function _fnAjaxDataSrcParam (settings, param, json) {
		var dataSrc = $.isPlainObject( settings.ajax )
			? settings.ajax.dataSrc
			: null;
	
		if (dataSrc && dataSrc[param]) {
			// Get from custom location
			return _fnGetObjectDataFn( dataSrc[param] )( json );
		}
	
		// else - Default behaviour
		var old = '';
	
		// Legacy support
		if (param === 'draw') {
			old = 'sEcho';
		}
		else if (param === 'recordsTotal') {
			old = 'iTotalRecords';
		}
		else if (param === 'recordsFiltered') {
			old = 'iTotalDisplayRecords';
		}
	
		return json[old] !== undefined
			? json[old]
			: json[param];
	}
	
	
	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} settings dataTables settings object
	 *  @param {object} input search information
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete ( settings, input )
	{
		var columnsSearch = settings.aoPreSearchCols;
	
		// In server-side processing all filtering is done by the server, so no point hanging around here
		if ( _fnDataSource( settings ) != 'ssp' )
		{
			// Check if any of the rows were invalidated
			_fnFilterData( settings );
	
			// Start from the full data set
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Global filter first
			_fnFilter( settings.aiDisplay, settings, input.search, input );
	
			$.each(settings.searchFixed, function (name, term) {
				_fnFilter(settings.aiDisplay, settings, term, {});
			});
	
			// Then individual column filters
			for ( var i=0 ; i<columnsSearch.length ; i++ )
			{
				var col = columnsSearch[i];
	
				_fnFilter(
					settings.aiDisplay,
					settings,
					col.search,
					col,
					i
				);
	
				$.each(settings.aoColumns[i].searchFixed, function (name, term) {
					_fnFilter(settings.aiDisplay, settings, term, {}, i);
				});
			}
	
			// And finally global filtering
			_fnFilterCustom( settings );
		}
	
		// Tell the draw function we have been filtering
		settings.bFiltered = true;
	
		_fnCallbackFire( settings, null, 'search', [settings] );
	}
	
	
	/**
	 * Apply custom filtering functions
	 * 
	 * This is legacy now that we have named functions, but it is widely used
	 * from 1.x, so it is not yet deprecated.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom( settings )
	{
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;
	
		for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
			var rows = [];
	
			// Loop over each row and see if it should be included
			for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
				rowIdx = displayRows[ j ];
				row = settings.aoData[ rowIdx ];
	
				if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
					rows.push( rowIdx );
				}
			}
	
			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			_fnArrayApply(displayRows, rows);
		}
	}
	
	
	/**
	 * Filter the data table based on user input and draw the table
	 */
	function _fnFilter( searchRows, settings, input, options, column )
	{
		if ( input === '' ) {
			return;
		}
	
		var i = 0;
		var matched = [];
	
		// Search term can be a function, regex or string - if a string we apply our
		// smart filtering regex (assuming the options require that)
		var searchFunc = typeof input === 'function' ? input : null;
		var rpSearch = input instanceof RegExp
			? input
			: searchFunc
				? null
				: _fnFilterCreateSearch( input, options );
	
		// Then for each row, does the test pass. If not, lop the row from the array
		for (i=0 ; i<searchRows.length ; i++) {
			var row = settings.aoData[ searchRows[i] ];
			var data = column === undefined
				? row._sFilterRow
				: row._aFilterData[ column ];
	
			if ( (searchFunc && searchFunc(data, row._aData, searchRows[i], column)) || (rpSearch && rpSearch.test(data)) ) {
				matched.push(searchRows[i]);
			}
		}
	
		// Mutate the searchRows array
		searchRows.length = matched.length;
	
		for (i=0 ; i<matched.length ; i++) {
			searchRows[i] = matched[i];
		}
	}
	
	
	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch( search, inOpts )
	{
		var not = [];
		var options = $.extend({}, {
			boundary: false,
			caseInsensitive: true,
			exact: false,
			regex: false,
			smart: true
		}, inOpts);
	
		if (typeof search !== 'string') {
			search = search.toString();
		}
	
		// Remove diacritics if normalize is set up to do so
		search = _normalize(search);
	
		if (options.exact) {
			return new RegExp(
				'^'+_fnEscapeRegex(search)+'$',
				options.caseInsensitive ? 'i' : ''
			);
		}
	
		search = options.regex ?
			search :
			_fnEscapeRegex( search );
		
		if ( options.smart ) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. And a negative look around for
			 * finding rows which don't contain a given string.
			 * 
			 * So this is the sort of thing we want to generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var parts = search.match( /!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g ) || [''];
			var a = parts.map( function ( word ) {
				var negative = false;
				var m;
	
				// Determine if it is a "does not include"
				if ( word.charAt(0) === '!' ) {
					negative = true;
					word = word.substring(1);
				}
	
				// Strip the quotes from around matched phrases
				if ( word.charAt(0) === '"' ) {
					m = word.match( /^"(.*)"$/ );
					word = m ? m[1] : word;
				}
				else if ( word.charAt(0) === '\u201C' ) {
					// Smart quote match (iPhone users)
					m = word.match( /^\u201C(.*)\u201D$/ );
					word = m ? m[1] : word;
				}
	
				// For our "not" case, we need to modify the string that is
				// allowed to match at the end of the expression.
				if (negative) {
					if (word.length > 1) {
						not.push('(?!'+word+')');
					}
	
					word = '';
				}
	
				return word.replace(/"/g, '');
			} );
	
			var match = not.length
				? not.join('')
				: '';
	
			var boundary = options.boundary
				? '\\b'
				: '';
	
			search = '^(?=.*?'+boundary+a.join( ')(?=.*?'+boundary )+')('+match+'.)*$';
		}
	
		return new RegExp( search, options.caseInsensitive ? 'i' : '' );
	}
	
	
	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;
	
	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;
	
	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var column;
		var j, jen, filterData, cellData, row;
		var wasInvalidated = false;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aFilterData ) {
				filterData = [];
	
				for ( j=0, jen=columns.length ; j<jen ; j++ ) {
					column = columns[j];
	
					if ( column.bSearchable ) {
						cellData = _fnGetCellData( settings, rowIdx, j, 'filter' );
	
						// Search in DataTables is string based
						if ( cellData === null ) {
							cellData = '';
						}
	
						if ( typeof cellData !== 'string' && cellData.toString ) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}
	
					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster https://jsperf.com/html-decode
					if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}
	
					if ( cellData.replace ) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}
	
					filterData.push( cellData );
				}
	
				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}
	
		return wasInvalidated;
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise ( settings )
	{
		var i;
		var init = settings.oInit;
		var deferLoading = settings.deferLoading;
		var dataSrc = _fnDataSource( settings );
	
		// Ensure that the table data is fully initialised
		if ( ! settings.bInitialised ) {
			setTimeout( function(){ _fnInitialise( settings ); }, 200 );
			return;
		}
	
		// Build the header / footer for the table
		_fnBuildHead( settings, 'header' );
		_fnBuildHead( settings, 'footer' );
	
		// Load the table's state (if needed) and then render around it and draw
		_fnLoadState( settings, init, function () {
			// Then draw the header / footer
			_fnDrawHead( settings, settings.aoHeader );
			_fnDrawHead( settings, settings.aoFooter );
	
			// Cache the paging start point, as the first redraw will reset it
			var iAjaxStart = settings.iInitDisplayStart
	
			// Local data load
			// Check if there is data passing into the constructor
			if ( init.aaData ) {
				for ( i=0 ; i<init.aaData.length ; i++ ) {
					_fnAddData( settings, init.aaData[ i ] );
				}
			}
			else if ( deferLoading || dataSrc == 'dom' ) {
				// Grab the data from the page
				_fnAddTr( settings, $(settings.nTBody).children('tr') );
			}
	
			// Filter not yet applied - copy the display master
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Enable features
			_fnAddOptionsHtml( settings );
			_fnSortInit( settings );
	
			_colGroup( settings );
	
			/* Okay to show that something is going on now */
			_fnProcessingDisplay( settings, true );
	
			_fnCallbackFire( settings, null, 'preInit', [settings], true );
	
			// If there is default sorting required - let's do it. The sort function
			// will do the drawing for us. Otherwise we draw the table regardless of the
			// Ajax source - this allows the table to look initialised for Ajax sourcing
			// data (show 'loading' message possibly)
			_fnReDraw( settings );
	
			// Server-side processing init complete is done by _fnAjaxUpdateDraw
			if ( dataSrc != 'ssp' || deferLoading ) {
				// if there is an ajax source load the data
				if ( dataSrc == 'ajax' ) {
					_fnBuildAjax( settings, {}, function(json) {
						var aData = _fnAjaxDataSrc( settings, json );
	
						// Got the data - add it to the table
						for ( i=0 ; i<aData.length ; i++ ) {
							_fnAddData( settings, aData[i] );
						}
	
						// Reset the init display for cookie saving. We've already done
						// a filter, and therefore cleared it before. So we need to make
						// it appear 'fresh'
						settings.iInitDisplayStart = iAjaxStart;
	
						_fnReDraw( settings );
						_fnProcessingDisplay( settings, false );
						_fnInitComplete( settings );
					}, settings );
				}
				else {
					_fnInitComplete( settings );
					_fnProcessingDisplay( settings, false );
				}
			}
		} );
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete ( settings )
	{
		if (settings._bInitComplete) {
			return;
		}
	
		var args = [settings, settings.json];
	
		settings._bInitComplete = true;
	
		// Table is fully set up and we have data, so calculate the
		// column widths
		_fnAdjustColumnSizing( settings );
	
		_fnCallbackFire( settings, null, 'plugin-init', args, true );
		_fnCallbackFire( settings, 'aoInitComplete', 'init', args, true );
	}
	
	function _fnLengthChange ( settings, val )
	{
		var len = parseInt( val, 10 );
		settings._iDisplayLength = len;
	
		_fnLengthOverflow( settings );
	
		// Fire length change event
		_fnCallbackFire( settings, null, 'length', [settings, len] );
	}
	
	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange ( settings, action, redraw )
	{
		var
			start     = settings._iDisplayStart,
			len       = settings._iDisplayLength,
			records   = settings.fnRecordsDisplay();
	
		if ( records === 0 || len === -1 )
		{
			start = 0;
		}
		else if ( typeof action === "number" )
		{
			start = action * len;
	
			if ( start > records )
			{
				start = 0;
			}
		}
		else if ( action == "first" )
		{
			start = 0;
		}
		else if ( action == "previous" )
		{
			start = len >= 0 ?
				start - len :
				0;
	
			if ( start < 0 )
			{
				start = 0;
			}
		}
		else if ( action == "next" )
		{
			if ( start + len < records )
			{
				start += len;
			}
		}
		else if ( action == "last" )
		{
			start = Math.floor( (records-1) / len) * len;
		}
		else if ( action === 'ellipsis' )
		{
			return;
		}
		else
		{
			_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
		}
	
		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;
	
		_fnCallbackFire( settings, null, changed ? 'page' : 'page-nc', [settings] );
	
		if ( changed && redraw ) {
			_fnDraw( settings );
		}
	
		return changed;
	}
	
	
	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings DataTables settings object
	 */
	function _processingHtml ( settings )
	{
		var table = settings.nTable;
		var scrolling = settings.oScroll.sX !== '' || settings.oScroll.sY !== '';
	
		if ( settings.oFeatures.bProcessing ) {
			var n = $('<div/>', {
					'id': settings.sTableId + '_processing',
					'class': settings.oClasses.processing.container,
					'role': 'status'
				} )
				.html( settings.oLanguage.sProcessing )
				.append('<div><div></div><div></div><div></div><div></div></div>');
	
			// Different positioning depending on if scrolling is enabled or not
			if (scrolling) {
				n.prependTo( $('div.dt-scroll', settings.nTableWrapper) );
			}
			else {
				n.insertBefore( table );
			}
	
			$(table).on( 'processing.dt.DT', function (e, s, show) {
				n.css( 'display', show ? 'block' : 'none' );
			} );
		}
	}
	
	
	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings DataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 */
	function _fnProcessingDisplay ( settings, show )
	{
		// Ignore cases when we are still redrawing
		if (settings.bDrawing && show === false) {
			return;
		}
	
		_fnCallbackFire( settings, null, 'processing', [settings, show] );
	}
	
	/**
	 * Show the processing element if an action takes longer than a given time
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} enable Do (true) or not (false) async processing (local feature enablement)
	 * @param {*} run Function to run
	 */
	function _fnProcessingRun( settings, enable, run ) {
		if (! enable) {
			// Immediate execution, synchronous
			run();
		}
		else {
			_fnProcessingDisplay(settings, true);
			
			// Allow the processing display to show if needed
			setTimeout(function () {
				run();
	
				_fnProcessingDisplay(settings, false);
			}, 0);
		}
	}
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable ( settings )
	{
		var table = $(settings.nTable);
	
		// Scrolling from here on in
		var scroll = settings.oScroll;
	
		if ( scroll.sX === '' && scroll.sY === '' ) {
			return settings.nTable;
		}
	
		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses.scrolling;
		var caption = settings.captionNode;
		var captionSide = caption ? caption._captionSide : null;
		var headerClone = $( table[0].cloneNode(false) );
		var footerClone = $( table[0].cloneNode(false) );
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function ( s ) {
			return !s ? null : _fnStringToCss( s );
		};
	
		if ( ! footer.length ) {
			footer = null;
		}
	
		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $( _div, { 'class': classes.container } )
			.append(
				$(_div, { 'class': classes.header.self } )
					.css( {
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.header.inner } )
							.css( {
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							} )
							.append(
								headerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'top' ? caption : null )
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.body } )
					.css( {
						position: 'relative',
						overflow: 'auto',
						width: size( scrollX )
					} )
					.append( table )
			);
	
		if ( footer ) {
			scroller.append(
				$(_div, { 'class': classes.footer.self } )
					.css( {
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.footer.inner } )
							.append(
								footerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'bottom' ? caption : null )
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}
	
		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;
	
		// When the body is scrolled, then we also want to scroll the headers
		$(scrollBody).on( 'scroll.DT', function () {
			var scrollLeft = this.scrollLeft;
	
			scrollHead.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollFoot.scrollLeft = scrollLeft;
			}
		} );
	
		// When focus is put on the header cells, we might need to scroll the body
		$('th, td', scrollHead).on('focus', function () {
			var scrollLeft = scrollHead.scrollLeft;
	
			scrollBody.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollBody.scrollLeft = scrollLeft;
			}
		});
	
		$(scrollBody).css('max-height', scrollY);
		if (! scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}
	
		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;
	
		// On redraw - align columns
		settings.aoDrawCallback.push(_fnScrollDraw);
	
		return scroller[0];
	}
	
	
	
	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Correct colgroup > col values if needed
	 *   3. Copy colgroup > col over to header and footer
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw ( settings )
	{
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll         = settings.oScroll,
			barWidth       = scroll.iBarWidth,
			divHeader      = $(settings.nScrollHead),
			divHeaderInner = divHeader.children('div'),
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl      = settings.nScrollBody,
			divBody        = $(divBodyEl),
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			footer         = settings.nTFoot && $('th, td', settings.nTFoot).length ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			headerCopy, footerCopy;
	
		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
		
		if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing( settings );
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}
	
		// 1. Re-create the table inside the scrolling div
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerCopy.find('th, td').removeAttr('tabindex');
		headerCopy.find('[id]').removeAttr('id');
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerCopy.find('[id]').removeAttr('id');
		}
	
		// 2. Correct colgroup > col values if needed
		// It is possible that the cell sizes are smaller than the content, so we need to
		// correct colgroup>col for such cases. This can happen if the auto width detection
		// uses a cell which has a longer string, but isn't the widest! For example 
		// "Chief Executive Officer (CEO)" is the longest string in the demo, but
		// "Systems Administrator" is actually the widest string since it doesn't collapse.
		// Note the use of translating into a column index to get the `col` element. This
		// is because of Responsive which might remove `col` elements, knocking the alignment
		// of the indexes out.
		if (settings.aiDisplay.length) {
			// Get the column sizes from the first row in the table. This should really be a
			// [].find, but it wasn't supported in Chrome until Sept 2015, and DT has 10 year
			// browser support
			var firstTr = null;
			var start = _fnDataSource( settings ) !== 'ssp'
				? settings._iDisplayStart
				: 0;
	
			for (i=start ; i<start + settings.aiDisplay.length ; i++) {
				var idx = settings.aiDisplay[i];
				var tr = settings.aoData[idx].nTr;
	
				if (tr) {
					firstTr = tr;
					break;
				}
			}
	
			if (firstTr) {
				var colSizes = $(firstTr).children('th, td').map(function (vis) {
					return {
						idx: _fnVisibleToColumnIndex(settings, vis),
						width: $(this).outerWidth()
					};
				});
	
				// Check against what the colgroup > col is set to and correct if needed
				for (var i=0 ; i<colSizes.length ; i++) {
					var colEl = settings.aoColumns[ colSizes[i].idx ].colEl[0];
					var colWidth = colEl.style.width.replace('px', '');
	
					if (colWidth !== colSizes[i].width) {
						colEl.style.width = colSizes[i].width + 'px';
	
						if (scroll.sX) {
							colEl.style.minWidth = colSizes[i].width + 'px';
						}
					}
				}
			}
		}
	
		// 3. Copy the colgroup over to the header and footer
		divHeaderTable
			.find('colgroup')
			.remove();
	
		divHeaderTable.append(settings.colgroup.clone());
	
		if ( footer ) {
			divFooterTable
				.find('colgroup')
				.remove();
	
			divFooterTable.append(settings.colgroup.clone());
		}
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely.
		$('th, td', headerCopy).each(function () {
			$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
		});
	
		if ( footer ) {
			$('th, td', footerCopy).each(function () {
				$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
			});
		}
	
		// 4. Clean up
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var paddingSide = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
	
		// Set the width's of the header and footer tables
		var outerWidth = table.outerWidth();
	
		divHeaderTable.css('width', _fnStringToCss( outerWidth ));
		divHeaderInner
			.css('width', _fnStringToCss( outerWidth ))
			.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
	
		if ( footer ) {
			divFooterTable.css('width', _fnStringToCss( outerWidth ));
			divFooterInner
				.css('width', _fnStringToCss( outerWidth ))
				.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
		}
	
		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').prependTo(table);
	
		// Adjust the position of the header in case we loose the y-scrollbar
		divBody.trigger('scroll');
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( settings )
	{
		// Not interested in doing column width calculation if auto-width is disabled
		if (! settings.oFeatures.bAutoWidth) {
			return;
		}
	
		var
			table = settings.nTable,
			columns = settings.aoColumns,
			scroll = settings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			visibleColumns = _fnGetColumns( settings, 'bVisible' ),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			i, column, columnIdx;
			
		var styleWidth = table.style.width;
		var containerWidth = _fnWrapperWidth(settings);
	
		// Don't re-run for the same width as the last time
		if (containerWidth === settings.containerWidth) {
			return false;
		}
	
		settings.containerWidth = containerWidth;
	
		// If there is no width applied as a CSS style or as an attribute, we assume that
		// the width is intended to be 100%, which is usually is in CSS, but it is very
		// difficult to correctly parse the rules to get the final result.
		if ( ! styleWidth && ! tableWidthAttr) {
			table.style.width = '100%';
			styleWidth = '100%';
		}
	
		if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
			tableWidthAttr = styleWidth;
		}
	
		// Let plug-ins know that we are doing a recalc, in case they have changed any of the
		// visible columns their own way (e.g. Responsive uses display:none).
		_fnCallbackFire(
			settings,
			null,
			'column-calc',
			{visible: visibleColumns},
			false
		);
	
		// Construct a single row, worst case, table with the widest
		// node in the data, assign any user defined widths, then insert it into
		// the DOM and allow the browser to do all the hard work of calculating
		// table widths
		var tmpTable = $(table.cloneNode())
			.css( 'visibility', 'hidden' )
			.removeAttr( 'id' );
	
		// Clean up the table body
		tmpTable.append('<tbody>')
		var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
	
		// Clone the table header and footer - we can't use the header / footer
		// from the cloned table, since if scrolling is active, the table's
		// real header and footer are contained in different table tags
		tmpTable
			.append( $(settings.nTHead).clone() )
			.append( $(settings.nTFoot).clone() );
	
		// Remove any assigned widths from the footer (from scrolling)
		tmpTable.find('tfoot th, tfoot td').css('width', '');
	
		// Apply custom sizing to the cloned header
		tmpTable.find('thead th, thead td').each( function () {
			// Get the `width` from the header layout
			var width = _fnColumnsSumWidth( settings, this, true, false );
	
			if ( width ) {
				this.style.width = width;
	
				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if ( scrollX ) {
					this.style.minWidth = width;
	
					$( this ).append( $('<div/>').css( {
						width: width,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					} ) );
				}
			}
			else {
				this.style.width = '';
			}
		} );
	
		// Find the widest piece of data for each column and put it into the table
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			columnIdx = visibleColumns[i];
			column = columns[ columnIdx ];
	
			var longest = _fnGetMaxLenString(settings, columnIdx);
			var autoClass = _ext.type.className[column.sType];
			var text = longest + column.sContentPadding;
			var insert = longest.indexOf('<') === -1
				? document.createTextNode(text)
				: text
			
			$('<td/>')
				.addClass(autoClass)
				.addClass(column.sClass)
				.append(insert)
				.appendTo(tr);
		}
	
		// Tidy the temporary table - remove name attributes so there aren't
		// duplicated in the dom (radio elements for example)
		$('[name]', tmpTable).removeAttr('name');
	
		// Table has been built, attach to the document so we can work with it.
		// A holding element is used, positioned at the top of the container
		// with minimal height, so it has no effect on if the container scrolls
		// or not. Otherwise it might trigger scrolling when it actually isn't
		// needed
		var holder = $('<div/>').css( scrollX || scrollY ?
				{
					position: 'absolute',
					top: 0,
					left: 0,
					height: 1,
					right: 0,
					overflow: 'hidden'
				} :
				{}
			)
			.append( tmpTable )
			.appendTo( tableContainer );
	
		// When scrolling (X or Y) we want to set the width of the table as 
		// appropriate. However, when not scrolling leave the table width as it
		// is. This results in slightly different, but I think correct behaviour
		if ( scrollX && scrollXInner ) {
			tmpTable.width( scrollXInner );
		}
		else if ( scrollX ) {
			tmpTable.css( 'width', 'auto' );
			tmpTable.removeAttr('width');
	
			// If there is no width attribute or style, then allow the table to
			// collapse
			if ( tmpTable.outerWidth() < tableContainer.clientWidth && tableWidthAttr ) {
				tmpTable.outerWidth( tableContainer.clientWidth );
			}
		}
		else if ( scrollY ) {
			tmpTable.outerWidth( tableContainer.clientWidth );
		}
		else if ( tableWidthAttr ) {
			tmpTable.outerWidth( tableWidthAttr );
		}
	
		// Get the width of each column in the constructed table
		var total = 0;
		var bodyCells = tmpTable.find('tbody tr').eq(0).children();
	
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			// Use getBounding for sub-pixel accuracy, which we then want to round up!
			var bounding = bodyCells[i].getBoundingClientRect().width;
	
			// Total is tracked to remove any sub-pixel errors as the outerWidth
			// of the table might not equal the total given here
			total += bounding;
	
			// Width for each column to use
			columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding );
		}
	
		table.style.width = _fnStringToCss( total );
	
		// Finished with the table - ditch it
		holder.remove();
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! settings._reszEvt ) {
			var resize = DataTable.util.throttle( function () {
				var newWidth = _fnWrapperWidth(settings);
	
				// Don't do it if destroying or the container width is 0
				if (! settings.bDestroying && newWidth !== 0) {
					_fnAdjustColumnSizing( settings );
				}
			} );
	
			// For browsers that support it (~2020 onwards for wide support) we can watch for the
			// container changing width.
			if (window.ResizeObserver) {
				// This is a tricky beast - if the element is visible when `.observe()` is called,
				// then the callback is immediately run. Which we don't want. If the element isn't
				// visible, then it isn't run, but we want it to run when it is then made visible.
				// This flag allows the above to be satisfied.
				var first = $(settings.nTableWrapper).is(':visible');
	
				// Use an empty div to attach the observer so it isn't impacted by height changes
				var resizer = $('<div>')
					.css({
						width: '100%',
						height: 0
					})
					.addClass('dt-autosize')
					.appendTo(settings.nTableWrapper);
	
				settings.resizeObserver = new ResizeObserver(function (e) {
					if (first) {
						first = false;
					}
					else {
						resize();
					}
				});
	
				settings.resizeObserver.observe(resizer[0]);
			}
			else {
				// For old browsers, the best we can do is listen for a window resize
				$(window).on('resize.DT-'+settings.sInstance, resize);
			}
	
			settings._reszEvt = true;
		}
	}
	
	/**
	 * Get the width of the DataTables wrapper element
	 *
	 * @param {*} settings DataTables settings object
	 * @returns Width
	 */
	function _fnWrapperWidth(settings) {
		return $(settings.nTableWrapper).is(':visible')
			? $(settings.nTableWrapper).width()
			: 0;
	}
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} string of the max length
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var column = settings.aoColumns[colIdx];
	
		if (! column.maxLenString) {
			var s, max='', maxLen = -1;
		
			for ( var i=0, ien=settings.aiDisplayMaster.length ; i<ien ; i++ ) {
				var rowIdx = settings.aiDisplayMaster[i];
				var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];
	
				var cellString = data && typeof data === 'object' && data.nodeType
					? data.innerHTML
					: data+'';
	
				// Remove id / name attributes from elements so they
				// don't interfere with existing elements
				cellString = cellString
					.replace(/id=".*?"/g, '')
					.replace(/name=".*?"/g, '');
	
				s = _stripHtml(cellString)
					.replace( /&nbsp;/g, ' ' );
		
				if ( s.length > maxLen ) {
					// We want the HTML in the string, but the length that
					// is important is the stripped string
					max = cellString;
					maxLen = s.length;
				}
			}
	
			column.maxLenString = max;
		}
	
		return column.maxLenString;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	/**
	 * Re-insert the `col` elements for current visibility
	 *
	 * @param {*} settings DT settings
	 */
	function _colGroup( settings ) {
		var cols = settings.aoColumns;
	
		settings.colgroup.empty();
	
		for (i=0 ; i<cols.length ; i++) {
			if (cols[i].bVisible) {
				settings.colgroup.append(cols[i].colEl);
			}
		}
	}
	
	
	function _fnSortInit( settings ) {
		var target = settings.nTHead;
		var headerRows = target.querySelectorAll('tr');
		var legacyTop = settings.bSortCellsTop;
		var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';
		
		// Legacy support for `orderCellsTop`
		if (legacyTop === true) {
			target = headerRows[0];
		}
		else if (legacyTop === false) {
			target = headerRows[ headerRows.length - 1 ];
		}
	
		_fnSortAttachListener(
			settings,
			target,
			target === settings.nTHead
				? 'tr'+notSelector+' th'+notSelector+', tr'+notSelector+' td'+notSelector
				: 'th'+notSelector+', td'+notSelector
		);
	
		// Need to resolve the user input array into our internal structure
		var order = [];
		_fnSortResolve( settings, order, settings.aaSorting );
	
		settings.aaSorting = order;
	}
	
	
	function _fnSortAttachListener(settings, node, selector, column, callback) {
		_fnBindAction( node, selector, function (e) {
			var run = false;
			var columns = column === undefined
				? _fnColumnsFromHeader( e.target )
				: [column];
	
			if ( columns.length ) {
				for ( var i=0, ien=columns.length ; i<ien ; i++ ) {
					var ret = _fnSortAdd( settings, columns[i], i, e.shiftKey );
	
					if (ret !== false) {
						run = true;
					}					
	
					// If the first entry is no sort, then subsequent
					// sort columns are ignored
					if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === '') {
						break;
					}
				}
	
				if (run) {
					_fnProcessingRun(settings, true, function () {
						_fnSort( settings );
						_fnSortDisplay( settings, settings.aiDisplay );
	
						_fnReDraw( settings, false, false );
	
						if (callback) {
							callback();
						}
					});
				}
			}
		} );
	}
	
	/**
	 * Sort the display array to match the master's order
	 * @param {*} settings
	 */
	function _fnSortDisplay(settings, display) {
		if (display.length < 2) {
			return;
		}
	
		var master = settings.aiDisplayMaster;
		var masterMap = {};
		var map = {};
		var i;
	
		// Rather than needing an `indexOf` on master array, we can create a map
		for (i=0 ; i<master.length ; i++) {
			masterMap[master[i]] = i;
		}
	
		// And then cache what would be the indexOf fom the display
		for (i=0 ; i<display.length ; i++) {
			map[display[i]] = masterMap[display[i]];
		}
	
		display.sort(function(a, b){
			// Short version of this function is simply `master.indexOf(a) - master.indexOf(b);`
			return map[a] - map[b];
		});
	}
	
	
	function _fnSortResolve (settings, nestedSort, sort) {
		var push = function ( a ) {
			if ($.isPlainObject(a)) {
				if (a.idx !== undefined) {
					// Index based ordering
					nestedSort.push([a.idx, a.dir]);
				}
				else if (a.name) {
					// Name based ordering
					var cols = _pluck( settings.aoColumns, 'sName');
					var idx = cols.indexOf(a.name);
	
					if (idx !== -1) {
						nestedSort.push([idx, a.dir]);
					}
				}
			}
			else {
				// Plain column index and direction pair
				nestedSort.push(a);
			}
		};
	
		if ( $.isPlainObject(sort) ) {
			// Object
			push(sort);
		}
		else if ( sort.length && typeof sort[0] === 'number' ) {
			// 1D array
			push(sort);
		}
		else if ( sort.length ) {
			// 2D array
			for (var z=0; z<sort.length; z++) {
				push(sort[z]); // Object or array
			}
		}
	}
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, k, kLen,
			aSort = [],
			extSort = DataTable.ext.type.order,
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [];
		
		if ( ! settings.oFeatures.bSort ) {
			return aSort;
		}
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( Array.isArray( fixed ) ) {
			_fnSortResolve( settings, nestedSort, fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			_fnSortResolve( settings, nestedSort, fixed.pre );
		}
	
		_fnSortResolve( settings, nestedSort, settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			_fnSortResolve( settings, nestedSort, fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
	
			if ( aoColumns[ srcCol ] ) {
				aDataSort = aoColumns[ srcCol ].aDataSort;
	
				for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
				{
					iCol = aDataSort[k];
					sType = aoColumns[ iCol ].sType || 'string';
	
					if ( nestedSort[i]._idx === undefined ) {
						nestedSort[i]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i][1]);
					}
	
					if ( nestedSort[i][1] ) {
						aSort.push( {
							src:       srcCol,
							col:       iCol,
							dir:       nestedSort[i][1],
							index:     nestedSort[i]._idx,
							type:      sType,
							formatter: extSort[ sType+"-pre" ],
							sorter:    extSort[ sType+"-"+nestedSort[i][1] ]
						} );
					}
				}
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSort ( oSettings, col, dir )
	{
		var
			i, ien, iLen,
			aiOrig = [],
			extSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Make sure the columns all have types defined
		_fnColumnTypes(oSettings);
	
		// Allow a specific column to be sorted, which will _not_ alter the display
		// master
		if (col !== undefined) {
			var srcCol = oSettings.aoColumns[col];
	
			aSort = [{
				src:       col,
				col:       col,
				dir:       dir,
				index:     0,
				type:      srcCol.sType,
				formatter: extSort[ srcCol.sType+"-pre" ],
				sorter:    extSort[ srcCol.sType+"-"+dir ]
			}];
			displayMaster = displayMaster.slice();
		}
		else {
			aSort = _fnSortFlatten( oSettings );
		}
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Reset the initial positions on each pass so we get a stable sort
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ i ] = i;
			}
	
			// If the first sort is desc, then reverse the array to preserve original
			// order, just in reverse
			if (aSort.length && aSort[0].dir === 'desc' && oSettings.orderDescReverse) {
				aiOrig.reverse();
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var test;
			 *    test = oSort['string-asc']('data11', 'data12');
			 *      if (test !== 0)
			 *        return test;
			 *    test = oSort['numeric-desc']('data21', 'data22');
			 *    if (test !== 0)
			 *      return test;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 */
			displayMaster.sort( function ( a, b ) {
				var
					x, y, k, test, sort,
					len=aSort.length,
					dataA = aoData[a]._aSortData,
					dataB = aoData[b]._aSortData;
	
				for ( k=0 ; k<len ; k++ ) {
					sort = aSort[k];
	
					// Data, which may have already been through a `-pre` function
					x = dataA[ sort.col ];
					y = dataB[ sort.col ];
	
					if (sort.sorter) {
						// If there is a custom sorter (`-asc` or `-desc`) for this
						// data type, use it
						test = sort.sorter(x, y);
	
						if ( test !== 0 ) {
							return test;
						}
					}
					else {
						// Otherwise, use generic sorting
						test = x<y ? -1 : x>y ? 1 : 0;
	
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
				}
	
				x = aiOrig[a];
				y = aiOrig[b];
	
				return x<y ? -1 : x>y ? 1 : 0;
			} );
		}
		else if ( aSort.length === 0 ) {
			// Apply index order
			displayMaster.sort(function (x, y) {
				return x<y ? -1 : x>y ? 1 : 0;
			});
		}
	
		if (col === undefined) {
			// Tell the draw function that we have sorted the data
			oSettings.bSorted = true;
			oSettings.sortDetails = aSort;
	
			_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort] );
		}
	
		return displayMaster;
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {int} addIndex Counter
	 *  @param {boolean} [shift=false] Shift click add
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAdd ( settings, colIdx, addIndex, shift )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = asSorting.indexOf(a[1]);
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		if ( ! col.bSortable ) {
			return false;
		}
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( (shift || addIndex) && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = _pluck(sorting, '0').indexOf(colIdx);
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null && sorting.length === 1 ) {
					nextSortIdx = 0; // can't remove sorting completely
				}
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else if (shift) {
				// No sort on this column yet, being added by shift click
				// add it as itself
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
			else {
				// No sort on this column yet, being added from a colspan
				// so add with same direction as first column
				sorting.push( [ colIdx, sorting[0][1], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.order.position;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, colIdx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ colIdx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, colIdx,
				_fnColumnIndexToVisible( settings, colIdx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
		var data = settings.aoData;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			// Sparse array
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[colIdx] || customSort ) {
				cellData = customSort ?
					customData[rowIdx] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, rowIdx, colIdx, 'sort' );
	
				row._aSortData[ colIdx ] = formatter ?
					formatter( cellData, settings ) :
					cellData;
			}
		}
	}
	
	
	/**
	 * State information for a table
	 *
	 * @param {*} settings
	 * @returns State object
	 */
	function _fnSaveState ( settings )
	{
		if (settings._bLoadingState) {
			return;
		}
	
		// Sort state saving uses [[idx, order]] structure.
		var sorting = [];
		_fnSortResolve(settings, sorting, settings.aaSorting );
	
		/* Store the interesting variables */
		var columns = settings.aoColumns;
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   sorting.map(function (sort) {
				// If a column name is available, use it
				return columns[sort[0]] && columns[sort[0]].sName
					? [ columns[sort[0]].sName, sort[1] ]
					: sort.slice();
			} ),
			search:  $.extend({}, settings.oPreviousSearch),
			columns: settings.aoColumns.map( function ( col, i ) {
				return {
					name: col.sName,
					visible: col.bVisible,
					search: $.extend({}, settings.aoPreSearchCols[i])
				};
			} )
		};
	
		settings.oSavedState = state;
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
		
		if ( settings.oFeatures.bStateSave && !settings.bDestroying )
		{
			settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
		}	
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, init, callback )
	{
		if ( ! settings.oFeatures.bStateSave ) {
			callback();
			return;
		}
	
		var loaded = function(state) {
			_fnImplementState(settings, state, callback);
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
	
		if ( state !== undefined ) {
			_fnImplementState( settings, state, callback );
		}
		// otherwise, wait for the loaded callback to be executed
	
		return true;
	}
	
	function _fnImplementState ( settings, s, callback) {
		var i, ien;
		var columns = settings.aoColumns;
		var currentNames = _pluck(settings.aoColumns, 'sName');
	
		settings._bLoadingState = true;
	
		// When StateRestore was introduced the state could now be implemented at any time
		// Not just initialisation. To do this an api instance is required in some places
		var api = settings._bInitComplete ? new DataTable.Api(settings) : null;
	
		if ( ! s || ! s.time ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Reject old data
		var duration = settings.iStateDuration;
		if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Allow custom and plug-in manipulation functions to alter the saved data set and
		// cancelling of loading by returning false
		var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
		if ( abStateLoad.indexOf(false) !== -1 ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend( true, {}, s );
	
		// This is needed for ColReorder, which has to happen first to allow all
		// the stored indexes to be usable. It is not publicly documented.
		_fnCallbackFire( settings, null, 'stateLoadInit', [settings, s], true );
	
		// Page Length
		if ( s.length !== undefined ) {
			// If already initialised just set the value directly so that the select element is also updated
			if (api) {
				api.page.len(s.length)
			}
			else {
				settings._iDisplayLength   = s.length;
			}
		}
	
		// Restore key features
		if ( s.start !== undefined ) {
			if(api === null) {
				settings._iDisplayStart    = s.start;
				settings.iInitDisplayStart = s.start;
			}
			else {
				_fnPageChange(settings, s.start/settings._iDisplayLength);
			}
		}
	
		// Order
		if ( s.order !== undefined ) {
			settings.aaSorting = [];
			$.each( s.order, function ( i, col ) {
				var set = [ col[0], col[1] ];
	
				// A column name was stored and should be used for restore
				if (typeof col[0] === 'string') {
					var idx = currentNames.indexOf(col[0]);
	
					// Find the name from the current list of column names, or fallback to index 0
					set[0] = idx >= 0
						? idx
						: 0;
				}
				else if (set[0] >= columns.length) {
					// If a column name, but it is out of bounds, set to 0
					set[0] = 0;
				}
	
				settings.aaSorting.push(set);
			} );
		}
	
		// Search
		if ( s.search !== undefined ) {
			$.extend( settings.oPreviousSearch, s.search );
		}
	
		// Columns
		if ( s.columns ) {
			var set = s.columns;
			var incoming = _pluck(s.columns, 'name');
	
			// Check if it is a 2.2 style state object with a `name` property for the columns, and if
			// the name was defined. If so, then create a new array that will map the state object
			// given, to the current columns (don't bother if they are already matching tho).
			if (incoming.join('').length && incoming.join('') !== currentNames.join('')) {
				set = [];
	
				// For each column, try to find the name in the incoming array
				for (i=0 ; i<currentNames.length ; i++) {
					if (currentNames[i] != '') {
						var idx = incoming.indexOf(currentNames[i]);
	
						if (idx >= 0) {
							set.push(s.columns[idx]);
						}
						else {
							// No matching column name in the state's columns, so this might be a new
							// column and thus can't have a state already.
							set.push({});
						}
					}
					else {
						// If no name, but other columns did have a name, then there is no knowing
						// where this one came from originally so it can't be restored.
						set.push({});
					}
				}
			}
	
			// If the number of columns to restore is different from current, then all bets are off.
			if (set.length === columns.length) {
				for ( i=0, ien=set.length ; i<ien ; i++ ) {
					var col = set[i];
	
					// Visibility
					if ( col.visible !== undefined ) {
						// If the api is defined, the table has been initialised so we need to use it rather than internal settings
						if (api) {
							// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
							api.column(i).visible(col.visible, false);
						}
						else {
							columns[i].bVisible = col.visible;
						}
					}
	
					// Search
					if ( col.search !== undefined ) {
						$.extend( settings.aoPreSearchCols[i], col.search );
					}
				}
	
				// If the api is defined then we need to adjust the columns once the visibility has been changed
				if (api) {
					api.columns.adjust();
				}
			}
		}
	
		settings._bLoadingState = false;
		_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
		callback();
	}
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'https://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			if ( settings ) {
				_fnCallbackFire( settings, null, 'dt-error', [ settings, tn, msg ], true );
			}
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( Array.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( Array.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( Object.prototype.hasOwnProperty.call(extender, prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object|string} selector Selector (for delegated events) or data object
	 *   to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, selector, fn )
	{
		$(n)
			.on( 'click.DT', selector, function (e) {
				fn(e);
			} )
			.on( 'keypress.DT', selector, function (e){
				if ( e.which === 13 ) {
					e.preventDefault();
					fn(e);
				}
			} )
			.on( 'selectstart.DT', selector, function () {
				// Don't want a double click resulting in text selection
				return false;
			} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} store Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( settings, store, fn )
	{
		if ( fn ) {
			settings[store].push(fn);
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @param {boolean} [bubbles] True if the event should bubble
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, eventName, args, bubbles )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = settings[callbackArr].slice().reverse().map( function (val) {
				return val.apply( settings.oInstance, args );
			} );
		}
	
		if ( eventName !== null) {
			var e = $.Event( eventName+'.dt' );
			var table = $(settings.nTable);
			
			// Expose the DataTables API on the event object for easy access
			e.dt = settings.api;
	
			table[bubbles ?  'trigger' : 'triggerHandler']( e, args );
	
			// If not yet attached to the document, trigger the event
			// on the body directly to sort of simulate the bubble
			if (bubbles && table.parents('body').length === 0) {
				$('body').trigger( e, args );
			}
	
			ret.push( e.result );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax ) {
			return 'ajax';
		}
		return 'dom';
	}
	
	/**
	 * Common replacement for language strings
	 *
	 * @param {*} settings DT settings object
	 * @param {*} str String with values to replace
	 * @param {*} entries Plural number for _ENTRIES_ - can be undefined
	 * @returns String
	 */
	function _fnMacros ( settings, str, entries )
	{
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is
		// used only internally
		var
			formatter  = settings.fnFormatNumber,
			start      = settings._iDisplayStart+1,
			len        = settings._iDisplayLength,
			vis        = settings.fnRecordsDisplay(),
			max        = settings.fnRecordsTotal(),
			all        = len === -1;
	
		return str.
			replace(/_START_/g, formatter.call( settings, start ) ).
			replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
			replace(/_MAX_/g,   formatter.call( settings, max ) ).
			replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
			replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
			replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) ).
			replace(/_ENTRIES_/g, settings.api.i18n('entries', '', entries) ).
			replace(/_ENTRIES-MAX_/g, settings.api.i18n('entries', '', max) ).
			replace(/_ENTRIES-TOTAL_/g, settings.api.i18n('entries', '', vis) );
	}
	
	/**
	 * Add elements to an array as quickly as possible, but stack stafe.
	 *
	 * @param {*} arr Array to add the data to
	 * @param {*} data Data array that is to be added
	 * @returns 
	 */
	function _fnArrayApply(arr, data) {
		if (! data) {
			return;
		}
	
		// Chrome can throw a max stack error if apply is called with
		// too large an array, but apply is faster.
		if (data.length < 10000) {
			arr.push.apply(arr, data);
		}
		else {
			for (i=0 ; i<data.length ; i++) {
				arr.push(data[i]);
			}
		}
	}
	
	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = _pluck(settings, 'nTable');
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oFeatures ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = tables.indexOf(mixed);
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed).get();
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed.get();
		}
	
		if ( jq ) {
			return settings.filter(function (v, idx) {
				return jq.includes(tables[idx]);
			});
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! (this instanceof _Api) ) {
			return new _Api( context, data );
		}
	
		var i;
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( Array.isArray( context ) ) {
			for ( i=0 ; i<context.length ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = settings.length > 1
			? _unique( settings )
			: settings;
	
		// Initial data
		_fnArrayApply(this, data);
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend( _Api.prototype, {
		any: function ()
		{
			return this.count() !== 0;
		},
	
		context: [], // array of table settings objects
	
		count: function ()
		{
			return this.flatten().length;
		},
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
		filter: function ( fn )
		{
			var a = __arrayProto.filter.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		flatten: function ()
		{
			var a = [];
	
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
		get: function ( idx )
		{
			return this[ idx ];
		},
	
		join:    __arrayProto.join,
	
		includes: function ( find ) {
			return this.indexOf( find ) === -1 ? false : true;
		},
	
		indexOf: __arrayProto.indexOf,
	
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'every' || type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
		lastIndexOf: __arrayProto.lastIndexOf,
	
		length:  0,
	
		map: function ( fn )
		{
			var a = __arrayProto.map.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		pluck: function ( prop )
		{
			var fn = DataTable.util.get(prop);
	
			return this.map( function ( el ) {
				return fn(el);
			} );
		},
	
		pop:     __arrayProto.pop,
	
		push:    __arrayProto.push,
	
		reduce: __arrayProto.reduce,
	
		reduceRight: __arrayProto.reduceRight,
	
		reverse: __arrayProto.reverse,
	
		// Object with rows, columns and opts
		selector: null,
	
		shift:   __arrayProto.shift,
	
		slice: function () {
			return new _Api( this.context, this );
		},
	
		sort:    __arrayProto.sort,
	
		splice:  __arrayProto.splice,
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
		to$: function ()
		{
			return $( this );
		},
	
		toJQuery: function ()
		{
			return $( this );
		},
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this.toArray()) );
		},
	
		unshift: __arrayProto.unshift
	} );
	
	
	function _api_scope( scope, fn, struc ) {
		return function () {
			var ret = fn.apply( scope || this, arguments );
	
			// Method extension
			_Api.extend( ret, ret, struc.methodExt );
			return ret;
		};
	}
	
	function _api_find( src, name ) {
		for ( var i=0, ien=src.length ; i<ien ; i++ ) {
			if ( src[i].name === name ) {
				return src[i];
			}
		}
		return null;
	}
	
	window.__apiStruct = __apiStruct;
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			struct;
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			if (struct.name === '__proto__') {
				continue;
			}
	
			// Value
			obj[ struct.name ] = struct.type === 'function' ?
				_api_scope( scope, struct.val, struct ) :
				struct.type === 'object' ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( Array.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = _api_find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   [],
					type:      'object'
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject( val ) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		if ( Array.isArray(selector) ) {
			var result = [];
	
			selector.forEach(function (sel) {
				var inner = __table_selector(sel, a);
	
				_fnArrayApply(result, inner);
			});
	
			return result.filter( function (item) {
				return item;
			});
		}
	
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = a.map( function (el) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function () {
				// Need to translate back from the table node to the settings
				var idx = nodes.indexOf(this);
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	// Common methods, combined to reduce size
	[
		['nodes', 'node', 'nTable'],
		['body', 'body', 'nTBody'],
		['header', 'header', 'nTHead'],
		['footer', 'footer', 'nTFoot'],
	].forEach(function (item) {
		_api_registerPlural(
			'tables().' + item[0] + '()',
			'table().' + item[1] + '()' ,
			function () {
				return this.iterator( 'table', function ( ctx ) {
					return ctx[item[2]];
				}, 1 );
			}
		);
	});
	
	// Structure methods
	[
		['header', 'aoHeader'],
		['footer', 'aoFooter'],
	].forEach(function (item) {
		_api_register( 'table().' + item[0] + '.structure()' , function (selector) {
			var indexes = this.columns(selector).indexes().flatten();
			var ctx = this.context[0];
			
			return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
		} );
	})
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	_api_register( 'tables().every()', function ( fn ) {
		var that = this;
	
		return this.iterator('table', function (s, i) {
			fn.call(that.table(i), i);
		});
	});
	
	_api_register( 'caption()', function ( value, side ) {
		var context = this.context;
	
		// Getter - return existing node's content
		if ( value === undefined ) {
			var caption = context[0].captionNode;
	
			return caption && context.length ?
				caption.innerHTML : 
				null;
		}
	
		return this.iterator( 'table', function ( ctx ) {
			var table = $(ctx.nTable);
			var caption = $(ctx.captionNode);
			var container = $(ctx.nTableWrapper);
	
			// Create the node if it doesn't exist yet
			if ( ! caption.length ) {
				caption = $('<caption/>').html( value );
				ctx.captionNode = caption[0];
	
				// If side isn't set, we need to insert into the document to let the
				// CSS decide so we can read it back, otherwise there is no way to
				// know if the CSS would put it top or bottom for scrolling
				if (! side) {
					table.prepend(caption);
	
					side = caption.css('caption-side');
				}
			}
	
			caption.html( value );
	
			if ( side ) {
				caption.css( 'caption-side', side );
				caption[0]._captionSide = side;
			}
	
			if (container.find('div.dataTables_scroll').length) {
				var selector = (side === 'top' ? 'Head' : 'Foot');
	
				container.find('div.dataTables_scroll'+ selector +' table').prepend(caption);
			}
			else {
				table.prepend(caption);
			}
		}, 1 );
	} );
	
	_api_register( 'caption.node()', function () {
		var ctx = this.context;
	
		return ctx.length ? ctx[0].captionNode : null;
	} );
	
	
	/**
	 * Redraw the tables in the current context.
	 */
	_api_register( 'draw()', function ( paging ) {
		return this.iterator( 'table', function ( settings ) {
			if ( paging === 'page' ) {
				_fnDraw( settings );
			}
			else {
				if ( typeof paging === 'string' ) {
					paging = paging === 'full-hold' ?
						false :
						true;
				}
	
				_fnReDraw( settings, paging===false );
			}
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function () {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide":     _fnDataSource( settings ) === 'ssp'
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		// Use the draw event to trigger a callback
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			_fnProcessingDisplay( settings, true );
	
			// Cancel an existing request
			var xhr = settings.jqXHR;
			if ( xhr && xhr.readyState !== 4 ) {
				xhr.abort();
			}
	
			// Trigger xhr
			_fnBuildAjax( settings, {}, function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnInitComplete( settings );
				_fnProcessingDisplay( settings, false );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return $.isPlainObject( ctx.ajax ) ?
				ctx.ajax.url :
				ctx.ajax;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( type, selector, selectFn, settings, opts )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && ! selector[i].match(/[[(:]/) ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = selectFn( typeof a[j] === 'string' ? (a[j]).trim() : a[j] );
	
				// Remove empty items
				res = res.filter( function (item) {
					return item !== null && item !== undefined;
				});
	
				if ( res && res.length ) {
					out = out.concat( res );
				}
			}
		}
	
		// selector extensions
		var ext = _ext.selector[ type ];
		if ( ext.length ) {
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				out = ext[i]( settings, opts, out );
			}
		}
	
		return _unique( out );
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && opts.search === undefined ) {
			opts.search = opts.filter;
		}
	
		return $.extend( {
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts );
	};
	
	
	// Reduce the API instance to the first item found
	var _selector_first = function ( old )
	{
		var inst = new _Api(old.context[0]);
	
		// Use a push rather than passing to the constructor, since it will
		// merge arrays down automatically, which isn't what is wanted here
		if (old.length) {
			inst.push( old[0] );
		}
	
		inst.selector = old.selector;
	
		// Limit to a single row / column / cell
		if (inst.length && inst[0].length > 1) {
			inst[0].splice(1);
		}
	
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			// In server-side processing mode, most options are irrelevant since
			// rows not shown don't exist and the index order is the applied order
			// Removed is a special case - for consistency just return an empty
			// array
			return search === 'removed' ?
				[] :
				_range( 0, displayMaster.length );
		}
	
		if ( page == 'current' ) {
			// Current page implies that order=current and filter=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			if ( search == 'none') {
				a = displayMaster.slice();
			}
			else if ( search == 'applied' ) {
				a = displayFiltered.slice();
			}
			else if ( search == 'removed' ) {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};
	
				for ( i=0, ien=displayFiltered.length ; i<ien ; i++ ) {
					displayFilteredMap[displayFiltered[i]] = null;
				}
	
				displayMaster.forEach(function (item) {
					if (! Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
						a.push(item);
					}
				});
			}
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if (! settings.aoData[i]) {
					continue;
				}
	
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = displayFiltered.indexOf(i);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
		else if ( typeof order === 'number' ) {
			// Order the rows by the given column
			var ordered = _fnSort(settings, order, 'asc');
	
			if (search === 'none') {
				a = ordered;
			}
			else { // applied | removed
				for (i=0; i<ordered.length; i++) {
					tmp = displayFiltered.indexOf(ordered[i]);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( ordered[i] );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function ( settings, selector, opts )
	{
		var rows;
		var run = function ( sel ) {
			var selInt = _intVal( sel );
			var aoData = settings.aoData;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			if ( ! rows ) {
				rows = _selector_row_indexes( settings, opts );
			}
	
			if ( selInt !== null && rows.indexOf(selInt) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( sel === null || sel === undefined || sel === '' ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return rows.map( function (idx) {
					var row = aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Selector - node
			if ( sel.nodeName ) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;
	
				if ( rowIdx !== undefined ) {
					// Make sure that the row is actually still present in the table
					return aoData[ rowIdx ] && aoData[ rowIdx ].nTr === sel ?
						[ rowIdx ] :
						[];
				}
				else if ( cellIdx ) {
					return aoData[ cellIdx.row ] && aoData[ cellIdx.row ].nTr === sel.parentNode ?
						[ cellIdx.row ] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[ host.data('dt-row') ] :
						[];
				}
			}
	
			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
				// get row index from id
				var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
				if ( rowObj !== undefined ) {
					return [ rowObj.idx ];
				}
	
				// need to fall through to jQuery in case there is DOM id that
				// matches
			}
			
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		};
	
		var matched = _selector_run( 'row', selector, run, settings, opts );
	
		if (opts.order === 'current' || opts.order === 'applied') {
			_fnSortDisplay(settings, matched);
		}
	
		return matched;
	};
	
	
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
		var a = [];
		var context = this.context;
	
		// `iterator` will drop undefined values, but in this case we want them
		for ( var i=0, ien=context.length ; i<ien ; i++ ) {
			for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
				var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
				a.push( (hash === true ? '#' : '' )+ id );
			}
		}
	
		return new _Api( context, a );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		this.iterator( 'row', function ( settings, row ) {
			var data = settings.aoData;
			var rowData = data[ row ];
	
			// Delete from the display arrays
			var idx = settings.aiDisplayMaster.indexOf(row);
			if (idx !== -1) {
				settings.aiDisplayMaster.splice(idx, 1);
			}
	
			// For server-side processing tables - subtract the deleted row from the count
			if ( settings._iRecordsDisplay > 0 ) {
				settings._iRecordsDisplay--;
			}
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
	
			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn( rowData._aData );
			if ( id !== undefined ) {
				delete settings.aIds[ id ];
			}
	
			data[row] = null;
		} );
	
		return this;
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		_fnArrayApply(modRows, newRows);
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length && this[0].length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		var row = ctx[0].aoData[ this[0] ];
		row._aData = data;
	
		// If the DOM has an id, and the data source is an array
		if ( Array.isArray( data ) && row.nTr && row.nTr.id ) {
			_fnSetObjectDataFn( ctx[0].rowId )( data, row.nTr.id );
		}
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		if (ctx.length && this.length && this[0].length) {
			var row = ctx[0].aoData[ this[0] ];
	
			if (row && row.nTr) {
				return row.nTr;
			}
		}
	
		return null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	$(document).on('plugin-init.dt', function (e, context) {
		var api = new _Api( context );
	
		api.on( 'stateSaveParams.DT', function ( e, settings, d ) {
			// This could be more compact with the API, but it is a lot faster as a simple
			// internal loop
			var idFn = settings.rowIdFn;
			var rows = settings.aiDisplayMaster;
			var ids = [];
	
			for (var i=0 ; i<rows.length ; i++) {
				var rowIdx = rows[i];
				var data = settings.aoData[rowIdx];
	
				if (data._detailsShow) {
					ids.push( '#' + idFn(data._aData) );
				}
			}
	
			d.childRows = ids;
		});
	
		// For future state loads (e.g. with StateRestore)
		api.on( 'stateLoaded.DT', function (e, settings, state) {
			__details_state_load( api, state );
		});
	
		// And the initial load state
		__details_state_load( api, api.state.loaded() );
	});
	
	var __details_state_load = function (api, state)
	{
		if ( state && state.childRows ) {
			api
				.rows( state.childRows.map(function (id) {
					// Escape any `:` characters from the row id. Accounts for
					// already escaped characters.
					return id.replace(/([^:\\]*(?:\\.[^:\\]*)*):/g, "$1\\:");
				}) )
				.every( function () {
					_fnCallbackFire( api.settings()[0], null, 'requestChild', [ this ] )
				});
		}
	}
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// Recursion to allow for arrays of jQuery objects
			if ( Array.isArray( r ) || r instanceof $ ) {
				for ( var i=0, ien=r.length ; i<ien ; i++ ) {
					addRow( r[i], k );
				}
				return;
			}
	
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				r.setAttribute( 'data-dt-row', row.idx );
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>')
					.attr( 'data-dt-row', row.idx )
					.addClass( k );
				
				$('td', created)
					.addClass( k )
					.html( r )[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		addRow( data, klass );
	
		if ( row._details ) {
			row._details.detach();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	// Make state saving of child row details async to allow them to be batch processed
	var __details_state = DataTable.util.throttle(
		function (ctx) {
			_fnSaveState( ctx[0] )
		},
		500
	);
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row && row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
				$( row.nTr ).removeClass( 'dt-hasChild' );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
					$( row.nTr ).addClass( 'dt-hasChild' );
				}
				else {
					row._details.detach();
					$( row.nTr ).removeClass( 'dt-hasChild' );
				}
	
				_fnCallbackFire( ctx[0], null, 'childRow', [ show, api.row( api[0] ) ] )
	
				__details_events( ctx[0] );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-sizing'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row && row._details ) {
						row._details.each(function () {
							var el = $(this).children('td');
	
							if (el.length == 1) {
								el.attr('colspan', visible);
							}
						});
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i] && data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length && ctx[0].aoData[ this[0] ]
				? ctx[0].aoData[ this[0] ]._details
				: undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length && ctx[0].aoData[ this[0] ] ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^([^:]+)?:(name|title|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows, type ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column, type ) );
		}
		return a;
	};
	
	
	var __column_header = function ( settings, column, row ) {
		var header = settings.aoHeader;
		var target = row !== undefined
			? row
			: settings.bSortCellsTop // legacy support
				? 0
				: header.length - 1;
	
		return header[target][column].cell;
	};
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			titles = _pluck( columns, 'sTitle' ),
			cells = DataTable.util.get('[].[].cell')(settings.aoHeader),
			nodes = _unique( _flatten([], cells) );
		
		var run = function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
	
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
	
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return columns.map(function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							__column_header( settings, idx )
						) ? idx : null;
				});
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						// Selector is a column index
						if (match[1] && match[1].match(/^\d+$/)) {
							var idx = parseInt( match[1], 10 );
	
							// Visible index given, convert to column index
							if ( idx < 0 ) {
								// Counting from the right
								var visColumns = columns.map( function (col,i) {
									return col.bVisible ? i : null;
								} );
								return [ visColumns[ visColumns.length + idx ] ];
							}
							// Counting from the left
							return [ _fnVisibleToColumnIndex( settings, idx ) ];
						}
						
						return columns.map( function (col, idx) {
							// Not visible, can't match
							if (! col.bVisible) {
								return null;
							}
	
							// Selector
							if (match[1]) {
								return $(nodes[idx]).filter(match[1]).length > 0 ? idx : null;
							}
	
							// `:visible` on its own
							return idx;
						} );
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return names.map( function (name, i) {
							return name === match[1] ? i : null;
						} );
	
					case 'title':
						// match by column title
						return titles.map( function (title, i) {
							return title === match[1] ? i : null;
						} );
	
					default:
						return [];
				}
			}
	
			// Cell in the table body
			if ( s.nodeName && s._DT_CellIndex ) {
				return [ s._DT_CellIndex.column ];
			}
	
			// jQuery selector on the TH elements for the columns
			var jqResult = $( nodes )
				.filter( s )
				.map( function () {
					return _fnColumnsFromHeader( this ); // `nodes` is column index complete and in order
				} )
				.toArray()
				.sort(function (a, b) {
					return a - b;
				});
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[ host.data('dt-column') ] :
				[];
		};
	
		return _selector_run( 'column', selector, run, settings, opts );
	};
	
	
	var __setColumnVis = function ( settings, column, vis ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return false;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = _pluck(cols, 'bVisible').indexOf(true, column+1);
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				if (data[i]) {
					tr = data[i].nTr;
					cells = data[i].anCells;
	
					if ( tr ) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
					}
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
	
		_colGroup(settings);
		
		return true;
	};
	
	
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_registerPlural( 'columns().header()', 'column().header()', function ( row ) {
		return this.iterator( 'column', function (settings, column) {
			return __column_header(settings, column, row);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( row ) {
		return this.iterator( 'column', function ( settings, column ) {
			var footer = settings.aoFooter;
	
			if (! footer.length) {
				return null;
			}
	
			return settings.aoFooter[row !== undefined ? row : 0][column].cell;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	_api_registerPlural( 'columns().render()', 'column().render()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return __columnData( settings, column, i, j, rows, type );
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().init()', 'column().init()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column];
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().titles()', 'column().title()', function (title, row) {
		return this.iterator( 'column', function ( settings, column ) {
			// Argument shifting
			if (typeof title === 'number') {
				row = title;
				title = undefined;
			}
	
			var span = $('span.dt-column-title', this.column(column).header(row));
	
			if (title !== undefined) {
				span.html(title);
				return this;
			}
	
			return span.html();
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().types()', 'column().type()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			var type = settings.aoColumns[column].sType;
	
			// If the type was invalidated, then resolve it. This actually does
			// all columns at the moment. Would only happen once if getting all
			// column's data types.
			if (! type) {
				_fnColumnTypes(settings);
			}
	
			return type;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		var that = this;
		var changed = [];
		var ret = this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			
			if (__setColumnVis( settings, column, vis )) {
				changed.push(column);
			}
		} );
	
		// Group the column visibility changes
		if ( vis !== undefined ) {
			this.iterator( 'table', function ( settings ) {
				// Redraw the header after changes
				_fnDrawHead( settings, settings.aoHeader );
				_fnDrawHead( settings, settings.aoFooter );
		
				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if ( ! settings.aiDisplay.length ) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}
		
				_fnSaveState( settings );
	
				// Second loop once the first is done for events
				that.iterator( 'column', function ( settings, column ) {
					if (changed.includes(column)) {
						_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
					}
				} );
	
				if ( changed.length && (calc === undefined || calc) ) {
					that.columns.adjust();
				}
			});
		}
	
		return ret;
	} );
	
	_api_registerPlural( 'columns().widths()', 'column().width()', function () {
		// Injects a fake row into the table for just a moment so the widths can
		// be read, regardless of colspan in the header and rows being present in
		// the body
		var columns = this.columns(':visible').count();
		var row = $('<tr>').html('<td>' + Array(columns).join('</td><td>') + '</td>');
	
		$(this.table().body()).append(row);
	
		var widths = row.children().map(function () {
			return $(this).outerWidth();
		});
	
		row.remove();
		
		return this.iterator( 'column', function ( settings, column ) {
			var visIdx = _fnColumnIndexToVisible( settings, column );
	
			return visIdx !== null ? widths[visIdx] : 0;
		}, 1);
	} );
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Force a column sizing to happen with a manual call - otherwise it can skip
			// if the size hasn't changed
			settings.containerWidth = -1;
	
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $(_flatten( [], cells ));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		var run = function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = data[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && rows.indexOf(s.row) !== -1 ?
					[s] :
					[];
			}
	
			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter( s )
				.map( function (i, el) {
					return { // use a new object, in case someone changes the values
						row:    el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
					};
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[ {
					row: host.data('dt-row'),
					column: host.data('dt-column')
				} ] :
				[];
		};
	
		return _selector_run( 'cell', selector, run, settings, opts );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( rowSelector.row === undefined ) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};
	
		// Row + column selector
		var columns = this.columns( columnSelector, internalOpts );
		var rows = this.rows( rowSelector, internalOpts );
		var i, ien, j, jen;
	
		var cellsNoOpts = this.iterator( 'table', function ( settings, idx ) {
			var a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells( cellsNoOpts, opts ) :
			cellsNoOpts;
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var data = settings.aoData[ row ];
	
			return data && data.anCells ?
				data.anCells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
		var args = Array.prototype.slice.call( arguments );
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( args.length > 1 ) {
			// Arguments passed in (list of 1D arrays)
			order = args;
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = Array.isArray(order) ? order.slice() : order;
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener(settings, node, {}, column, callback);
		} );
	} );
	
	
	_api_register( 'order.fixed()', function ( set ) {
		if ( ! set ) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;
	
			return Array.isArray( fixed ) ?
				{ pre: fixed } :
				fixed;
		}
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSortingFixed = $.extend( true, {}, set );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		if ( ! dir ) {
			return this.iterator( 'column', function ( settings, idx ) {
				var sort = _fnSortFlatten( settings );
	
				for ( var i=0, ien=sort.length ; i<ien ; i++ ) {
					if ( sort[i].col === idx ) {
						return sort[i].dir;
					}
				}
	
				return null;
			}, 1 );
		}
		else {
			return this.iterator( 'table', function ( settings, i ) {
				settings.aaSorting = that[i].map( function (col) {
					return [ col, dir ];
				} );
			} );
		}
	} );
	
	_api_registerPlural('columns().orderable()', 'column().orderable()', function ( directions ) {
		return this.iterator( 'column', function ( settings, idx ) {
			var col = settings.aoColumns[idx];
	
			return directions ?
				col.asSorting :
				col.bSortable;
		}, 1 );
	} );
	
	
	_api_register( 'processing()', function ( show ) {
		return this.iterator( 'table', function ( ctx ) {
			_fnProcessingDisplay( ctx, show );
		} );
	} );
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.search :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			if (typeof regex === 'object') {
				// New style options to pass to the search builder
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, regex, {
					search: input
				} ) );
			}
			else {
				// Compat for the old options
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, {
					search: input,
					regex:  regex === null ? false : regex,
					smart:  smart === null ? true  : smart,
					caseInsensitive: caseInsen === null ? true : caseInsen
				} ) );
			}
		} );
	} );
	
	_api_register( 'search.fixed()', function ( name, search ) {
		var ret = this.iterator( true, 'table', function ( settings ) {
			var fixed = settings.searchFixed;
	
			if (! name) {
				return Object.keys(fixed)
			}
			else if (search === undefined) {
				return fixed[name];
			}
			else if (search === null) {
				delete fixed[name];
			}
			else {
				fixed[name] = search;
			}
	
			return this;
		} );
	
		return name !== undefined && search === undefined
			? ret[0]
			: ret;
	} );
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].search;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				if (typeof regex === 'object') {
					// New style options to pass to the search builder
					$.extend( preSearch[ column ], regex, {
						search: input
					} );
				}
				else {
					// Old style (with not all options available)
					$.extend( preSearch[ column ], {
						search: input,
						regex:  regex === null ? false : regex,
						smart:  smart === null ? true  : smart,
						caseInsensitive: caseInsen === null ? true : caseInsen
					} );
				}
	
				_fnFilterComplete( settings, settings.oPreviousSearch );
			} );
		}
	);
	
	_api_register([
			'columns().search.fixed()',
			'column().search.fixed()'
		],
		function ( name, search ) {
			var ret = this.iterator( true, 'column', function ( settings, colIdx ) {
				var fixed = settings.aoColumns[colIdx].searchFixed;
	
				if (! name) {
					return Object.keys(fixed)
				}
				else if (search === undefined) {
					return fixed[name];
				}
				else if (search === null) {
					delete fixed[name];
				}
				else {
					fixed[name] = search;
				}
	
				return this;
			} );
	
			return name !== undefined && search === undefined
				? ret[0]
				: ret;
		}
	);
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function ( set, ignoreTime ) {
		// getter
		if ( ! set ) {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		}
	
		var setMutate = $.extend( true, {}, set );
	
		// setter
		return this.iterator( 'table', function ( settings ) {
			if ( ignoreTime !== false ) {
				setMutate.time = +new Date() + 100;
			}
	
			_fnImplementState( settings, setMutate, function(){} );
		} );
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	// Can be assigned in DateTable.use() - note luxon and moment vars are in helpers.js
	var __bootstrap;
	var __foundation;
	
	/**
	 * Set the libraries that DataTables uses, or the global objects.
	 * Note that the arguments can be either way around (legacy support)
	 * and the second is optional. See docs.
	 */
	DataTable.use = function (arg1, arg2) {
		// Reverse arguments for legacy support
		var module = typeof arg1 === 'string'
			? arg2
			: arg1;
		var type = typeof arg2 === 'string'
			? arg2
			: arg1;
	
		// Getter
		if (module === undefined && typeof type === 'string') {
			switch (type) {
				case 'lib':
				case 'jq':
					return $;
	
				case 'win':
					return window;
	
				case 'datetime':
					return DataTable.DateTime;
	
				case 'luxon':
					return __luxon;
	
				case 'moment':
					return __moment;
	
				case 'bootstrap':
					// Use local if set, otherwise try window, which could be undefined
					return __bootstrap || window.bootstrap;
	
				case 'foundation':
					// Ditto
					return __foundation || window.Foundation;
	
				default:
					return null;
			}
		}
	
		// Setter
		if (type === 'lib' || type === 'jq' || (module && module.fn && module.fn.jquery)) {
			$ = module;
		}
		else if (type === 'win' || (module && module.document)) {
			window = module;
			document = module.document;
		}
		else if (type === 'datetime' || (module && module.type === 'DateTime')) {
			DataTable.DateTime = module;
		}
		else if (type === 'luxon' || (module && module.FixedOffsetZone)) {
			__luxon = module;
		}
		else if (type === 'moment' || (module && module.isMoment)) {
			__moment = module;
		}
		else if (type === 'bootstrap' || (module && module.Modal && module.Modal.NAME === 'modal'))
		{
			// This is currently for BS5 only. BS3/4 attach to jQuery, so no need to use `.use()`
			__bootstrap = module;
		}
		else if (type === 'foundation' || (module && module.Reveal)) {
			__foundation = module;
		}
	}
	
	/**
	 * CommonJS factory function pass through. This will check if the arguments
	 * given are a window object or a jQuery object. If so they are set
	 * accordingly.
	 * @param {*} root Window
	 * @param {*} jq jQUery
	 * @returns {boolean} Indicator
	 */
	DataTable.factory = function (root, jq) {
		var is = false;
	
		// Test if the first parameter is a window object
		if (root && root.document) {
			window = root;
			document = root.document;
		}
	
		// Test if the second parameter is a jQuery object
		if (jq && jq.fn && jq.fn.jquery) {
			$ = jq;
			is = true;
		}
	
		return is;
	}
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @param {string} [version2=current DataTables version] As above, but optional.
	 *   If not given the current DataTables version will be used.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = function( version, version2 )
	{
		var aThis = version2 ?
			version2.split('.') :
			DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		if ( table instanceof DataTable.Api ) {
			return true;
		}
	
		$.each( DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
	
			if ( o.nTable === t || head === t || foot === t ) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = function ( visible )
	{
		var api = false;
	
		if ( $.isPlainObject( visible ) ) {
			api = visible.api;
			visible = visible.visible;
		}
	
		var a = DataTable.settings
			.filter( function (o) {
				return !visible || (visible && $(o.nTable).is(':visible')) 
					? true
					: false;
			} )
			.map( function (o) {
				return o.nTable;
			});
	
		return api ?
			new _Api( a ) :
			a;
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			args[0] = args[0].split( /\s/ ).map( function ( e ) {
				return ! e.match(/\.dt\b/) ?
					e+'.dt' :
					e;
				} ).join( ' ' );
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'error()', function (msg) {
		return this.iterator( 'table', function ( settings ) {
			_fnLog( settings, 0, msg );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'trigger()', function ( name, args, bubbles ) {
		return this.iterator( 'table', function ( settings ) {
			return _fnCallbackFire( settings, null, name, args, bubbles );
		} ).flatten();
	} );
	
	
	_api_register( 'ready()', function ( fn ) {
		var ctx = this.context;
	
		// Get status of first table
		if (! fn) {
			return ctx.length
				? (ctx[0]._bInitComplete || false)
				: null;
		}
	
		// Function to run either once the table becomes ready or
		// immediately if it is already ready.
		return this.tables().every(function () {
			var api = this;
	
			if (this.context[0]._bInitComplete) {
				fn.call(api);
			}
			else {
				this.on('init.dt.DT', function () {
					fn.call(api);
				});
			}
		} );
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = settings.aoData.map( function (r) { return r ? r.nTr : null; } );
			var orderClasses = classes.order;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings], true );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Container width change listener
			if (settings.resizeObserver) {
				settings.resizeObserver.disconnect();
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			// Clean up the header
			$(thead).find('span.dt-column-order').remove();
			$(thead).find('span.dt-column-title').each(function () {
				var title = $(this).html();
				$(this).parent().append(title);
				$(this).remove();
			});
	
			settings.colgroup.remove();
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$(jqTable).find('th, td').removeClass(
				$.map(DataTable.ext.type.className, function (v) {
					return v;
				}).join(' ')
			);
	
			$('th, td', thead)
				.removeClass(
					orderClasses.none + ' ' +
					orderClasses.canAsc + ' ' +
					orderClasses.canDesc + ' ' +
					orderClasses.isAsc + ' ' +
					orderClasses.isDesc
				)
				.css('width', '')
				.removeAttr('data-dt-column')
				.removeAttr('aria-sort');
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			var orig = settings.nTableWrapper.parentNode;
			var insertBefore = settings.nTableWrapper.nextSibling;
	
			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[ removedMethod ]();
			jqWrapper[ removedMethod ]();
	
			// If we need to reattach the table to the document
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, insertBefore );
	
				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css( 'width', settings.sDestroyWidth )
					.removeClass( classes.table );
			}
	
			/* Remove the settings object from the settings array */
			var idx = DataTable.settings.indexOf(settings);
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	
	
	// Add the `every()` method for rows, columns and cells in a compact form
	$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
		_api_register( type+'s().every()', function ( fn ) {
			var opts = this.selector.opts;
			var api = this;
			var inst;
			var counter = 0;
	
			return this.iterator( 'every', function ( settings, selectedIdx, tableIdx ) {
				inst = api[ type ](selectedIdx, opts);
	
				if (type === 'cell') {
					fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
				}
				else {
					fn.call(inst, selectedIdx, tableIdx, counter);
				}
	
				counter++;
			} );
		} );
	} );
	
	
	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register( 'i18n()', function ( token, def, plural ) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
	
		if ( resolved === undefined ) {
			resolved = def;
		}
	
		if ( $.isPlainObject( resolved ) ) {
			resolved = plural !== undefined && resolved[ plural ] !== undefined ?
				resolved[ plural ] :
				resolved._;
		}
	
		return typeof resolved === 'string'
			? resolved.replace( '%d', plural ) // nb: plural might be undefined,
			: resolved;
	} );
	
	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See https://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "2.2.2";
	
	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];
	
	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 */
		"caseInsensitive": true,
	
		/**
		 * Applied search term
		 */
		"search": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 */
		"regex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 */
		"smart": true,
	
		/**
		 * Flag to indicate if DataTables should only trigger a search when
		 * the return key is pressed.
		 */
		"return": false
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 */
		"_sFilterRow": null,
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 */
		"src": null,
	
		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 */
		"idx": -1,
	
		/**
		 * Cached display value
		 */
		displayData: null
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index.
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 */
		"mRender": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 */
		"sSortingClass": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 */
		"sWidthOrig": null,
	
		/** Cached string which is the longest in the column */
		maxLenString: null,
	
		/**
		 * Store for named searches
		 */
		searchFixed: null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 */
		"aoSearchCols": [],
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 */
		"bDeferRender": true,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 */
		"bFilter": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bInfo": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bLengthChange": true,
	
		/**
		 * Enable or disable pagination.
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 */
		"bSortCellsTop": null,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 */
		"fnRowCallback": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateSaveCallback": function ( settings, data ) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_'+settings.sInstance+'_'+location.pathname,
					JSON.stringify( data )
				);
			} catch (e) {
				// noop
			}
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 */
		"iStateDuration": 7200,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 */
		"iTabIndex": 0,
	
	
		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 */
		"oClasses": {},
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be sorted
				 */
				"orderable": ": Activate to sort",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being sorted
				 */
				"orderableReverse": ": Activate to invert sorting",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being 
				 * sorted and next step is to remove sorting
				 */
				"orderableRemove": ": Activate to remove sorting",
	
				paginate: {
					first: 'First',
					last: 'Last',
					next: 'Next',
					previous: 'Previous',
					number: ''
				}
			},
	
			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 */
			"oPaginate": {
				/**
				 * Label and character for first page button («)
				 */
				"sFirst": "\u00AB",
	
				/**
				 * Last page button (»)
				 */
				"sLast": "\u00BB",
	
				/**
				 * Next page button (›)
				 */
				"sNext": "\u203A",
	
				/**
				 * Previous page button (‹)
				 */
				"sPrevious": "\u2039",
			},
	
			/**
			 * Plural object for the data type the table is showing
			 */
			entries: {
				_: "entries",
				1: "entry"
			},
	
			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 */
			"sEmptyTable": "No data available in table",
	
	
			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
	
	
			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
	
	
			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 */
			"sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",
	
	
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 */
			"sInfoPostFix": "",
	
	
			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 */
			"sDecimal": "",
	
	
			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 */
			"sThousands": ",",
	
	
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 */
			"sLengthMenu": "_MENU_ _ENTRIES_ per page",
	
	
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 */
			"sLoadingRecords": "Loading...",
	
	
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 */
			"sProcessing": "",
	
	
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 */
			"sSearch": "Search:",
	
	
			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",
	
	
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 */
			"sUrl": "",
	
	
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/** The initial data order is reversed when `desc` ordering */
		orderDescReverse: true,
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * Table and control layout. This replaces the legacy `dom` option.
		 */
		layout: {
			topStart: 'pageLength',
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},
	
	
		/**
		 * Legacy DOM layout option
		 */
		"sDom": null,
	
	
		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 */
		"searchDelay": null,
	
	
		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 */
		"sPaginationType": "",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 */
		"sScrollY": "",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 */
		"sServerMethod": "GET",
	
	
		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 */
		"renderer": null,
	
	
		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 */
		"rowId": "DT_RowId",
	
	
		/**
		 * Caption value
		 */
		"caption": null,
	
	
		/**
		 * For server-side processing - use the data from the DOM for the first draw
		 */
		iDeferLoading: null
	};
	
	_fnHungarianMap( DataTable.defaults );
	
	
	
	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 */
		"aDataSort": null,
		"iDataSort": -1,
	
		ariaTitle: '',
	
	
		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 */
		"asSorting": [ 'asc', 'desc', '' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable ordering on this column.
		 */
		"bSortable": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 */
		"bVisible": true,
	
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 */
		"sWidth": null
	};
	
	_fnHungarianMap( DataTable.defaults.column );
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all for DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bFilter": null,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bInfo": true,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bLengthChange": true,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 */
		"oBrowser": {
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 */
			"bScrollbarLeft": false,
	
			/**
			 * Browser scrollbar width
			 */
			"barWidth": 0
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Map of row ids to data indexes
		 */
		"aIds": {},
	
		/**
		 * Store information about each column that is in use
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store for named searches
		 */
		searchFixed: {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSortingFixed": [],
	
		/**
		 * If restoring a table - we should restore its width
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if all required information has been read in
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sPaginationType": "two_button",
	
		/**
		 * Number of paging controls on the page. Only used for backwards compatibility
		 */
		pagingControls: 0,
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 */
		"oLoadedState": null,
	
		/**
		 * Note if draw should be blocked while getting data
		 */
		"bAjaxDataGet": true,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 */
		"oAjaxData": undefined,
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * The classes to use for the table
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 */
		"oPlugins": {},
	
		/**
		 * Function used to get a row's id from the row's data
		 */
		"rowIdFn": null,
	
		/**
		 * Data location where to store a row's id
		 */
		"rowId": null,
	
		caption: '',
	
		captionNode: null,
	
		colgroup: null,
	
		/** Delay loading of data */
		deferLoading: null,
	
		/** Allow auto type detection */
		typeDetect: true,
	
		/** ResizeObserver for the container div */
		resizeObserver: null,
	
		/** Keep a record of the last size of the container, so we can skip duplicates */
		containerWidth: -1
	};
	
	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	var extPagination = DataTable.ext.pager;
	
	// Paging buttons configuration
	$.extend( extPagination, {
		simple: function () {
			return [ 'previous', 'next' ];
		},
	
		full: function () {
			return [ 'first', 'previous', 'next', 'last' ];
		},
	
		numbers: function () {
			return [ 'numbers' ];
		},
	
		simple_numbers: function () {
			return [ 'previous', 'numbers', 'next' ];
		},
	
		full_numbers: function () {
			return [ 'first', 'previous', 'numbers', 'next', 'last' ];
		},
	
		first_last: function () {
			return ['first', 'last'];
		},
	
		first_last_numbers: function () {
			return ['first', 'numbers', 'last'];
		},
	
		// For testing and plug-ins to use
		_numbers: _pagingNumbers,
	
		// Number of number buttons - legacy, use `numbers` option for paging feature
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pagingButton: {
			_: function (settings, buttonType, content, active, disabled) {
				var classes = settings.oClasses.paging;
				var btnClasses = [classes.button];
				var btn;
	
				if (active) {
					btnClasses.push(classes.active);
				}
	
				if (disabled) {
					btnClasses.push(classes.disabled)
				}
	
				if (buttonType === 'ellipsis') {
					btn = $('<span class="ellipsis"></span>').html(content)[0];
				}
				else {
					btn = $('<button>', {
						class: btnClasses.join(' '),
						role: 'link',
						type: 'button'
					}).html(content);
				}
	
				return {
					display: btn,
					clicker: btn
				}
			}
		},
	
		pagingContainer: {
			_: function (settings, buttons) {
				// No wrapping element - just append directly to the host
				return buttons;
			}
		}
	} );
	
	// Common function to remove new lines, strip HTML and diacritic control
	var _filterString = function (stripHtml, normalize) {
		return function (str) {
			if (_empty(str) || typeof str !== 'string') {
				return str;
			}
	
			str = str.replace( _re_new_lines, " " );
	
			if (stripHtml) {
				str = _stripHtml(str);
			}
	
			if (normalize) {
				str = _normalize(str, false);
			}
	
			return str;
		};
	}
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	/**
	 * Common logic for moment, luxon or a date action.
	 *
	 * Happens after __mldObj, so don't need to call `resolveWindowsLibs` again
	 */
	function __mld( dtLib, momentFn, luxonFn, dateFn, arg1 ) {
		if (__moment) {
			return dtLib[momentFn]( arg1 );
		}
		else if (__luxon) {
			return dtLib[luxonFn]( arg1 );
		}
		
		return dateFn ? dtLib[dateFn]( arg1 ) : dtLib;
	}
	
	
	var __mlWarning = false;
	var __luxon; // Can be assigned in DateTable.use()
	var __moment; // Can be assigned in DateTable.use()
	
	/**
	 * 
	 */
	function resolveWindowLibs() {
		if (window.luxon && ! __luxon) {
			__luxon = window.luxon;
		}
		
		if (window.moment && ! __moment) {
			__moment = window.moment;
		}
	}
	
	function __mldObj (d, format, locale) {
		var dt;
	
		resolveWindowLibs();
	
		if (__moment) {
			dt = __moment.utc( d, format, locale, true );
	
			if (! dt.isValid()) {
				return null;
			}
		}
		else if (__luxon) {
			dt = format && typeof d === 'string'
				? __luxon.DateTime.fromFormat( d, format )
				: __luxon.DateTime.fromISO( d );
	
			if (! dt.isValid) {
				return null;
			}
	
			dt = dt.setLocale(locale);
		}
		else if (! format) {
			// No format given, must be ISO
			dt = new Date(d);
		}
		else {
			if (! __mlWarning) {
				alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
			}
	
			__mlWarning = true;
		}
	
		return dt;
	}
	
	// Wrapper for date, datetime and time which all operate the same way with the exception of
	// the output string for auto locale support
	function __mlHelper (localeString) {
		return function ( from, to, locale, def ) {
			// Luxon and Moment support
			// Argument shifting
			if ( arguments.length === 0 ) {
				locale = 'en';
				to = null; // means toLocaleString
				from = null; // means iso8601
			}
			else if ( arguments.length === 1 ) {
				locale = 'en';
				to = from;
				from = null;
			}
			else if ( arguments.length === 2 ) {
				locale = to;
				to = from;
				from = null;
			}
	
			var typeName = 'datetime' + (to ? '-' + to : '');
	
			// Add type detection and sorting specific to this date format - we need to be able to identify
			// date type columns as such, rather than as numbers in extensions. Hence the need for this.
			if (! DataTable.ext.type.order[typeName + '-pre']) {
				DataTable.type(typeName, {
					detect: function (d) {
						// The renderer will give the value to type detect as the type!
						return d === typeName ? typeName : false;
					},
					order: {
						pre: function (d) {
							// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
							// `valueOf` which gives milliseconds epoch
							return d.valueOf();
						}
					},
					className: 'dt-right'
				});
			}
		
			return function ( d, type ) {
				// Allow for a default value
				if (d === null || d === undefined) {
					if (def === '--now') {
						// We treat everything as UTC further down, so no changes are
						// made, as such need to get the local date / time as if it were
						// UTC
						var local = new Date();
						d = new Date( Date.UTC(
							local.getFullYear(), local.getMonth(), local.getDate(),
							local.getHours(), local.getMinutes(), local.getSeconds()
						) );
					}
					else {
						d = '';
					}
				}
	
				if (type === 'type') {
					// Typing uses the type name for fast matching
					return typeName;
				}
	
				if (d === '') {
					return type !== 'sort'
						? ''
						: __mldObj('0000-01-01 00:00:00', null, locale);
				}
	
				// Shortcut. If `from` and `to` are the same, we are using the renderer to
				// format for ordering, not display - its already in the display format.
				if ( to !== null && from === to && type !== 'sort' && type !== 'type' && ! (d instanceof Date) ) {
					return d;
				}
	
				var dt = __mldObj(d, from, locale);
	
				if (dt === null) {
					return d;
				}
	
				if (type === 'sort') {
					return dt;
				}
				
				var formatted = to === null
					? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
					: __mld(dt, 'format', 'toFormat', 'toISOString', to);
	
				// XSS protection
				return type === 'display' ?
					_escapeHtml( formatted ) :
					formatted;
			};
		}
	}
	
	// Based on locale, determine standard number formatting
	// Fallback for legacy browsers is US English
	var __thousands = ',';
	var __decimal = '.';
	
	if (window.Intl !== undefined) {
		try {
			var num = new Intl.NumberFormat().formatToParts(100000.1);
		
			for (var i=0 ; i<num.length ; i++) {
				if (num[i].type === 'group') {
					__thousands = num[i].value;
				}
				else if (num[i].type === 'decimal') {
					__decimal = num[i].value;
				}
			}
		}
		catch (e) {
			// noop
		}
	}
	
	// Formatted date time detection - use by declaring the formats you are going to use
	DataTable.datetime = function ( format, locale ) {
		var typeName = 'datetime-' + format;
	
		if (! locale) {
			locale = 'en';
		}
	
		if (! DataTable.ext.type.order[typeName]) {
			DataTable.type(typeName, {
				detect: function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				},
				order: {
					pre: function (d) {
						return __mldObj(d, format, locale) || 0;
					}
				},
				className: 'dt-right'
			});
		}
	}
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `moment` - Uses the MomentJS library to convert from a given format into another.
	 * This renderer has three overloads:
	 *   * 1 parameter:
	 *     * `string` - Format to convert to (assumes input is ISO8601 and locale is `en`)
	 *   * 2 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to. Assumes `en` locale
	 *   * 3 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to
	 *     * `string` - Locale
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		date: __mlHelper('toLocaleDateString'),
		datetime: __mlHelper('toLocaleString'),
		time: __mlHelper('toLocaleTimeString'),
		number: function ( thousands, decimal, precision, prefix, postfix ) {
			// Auto locale detection
			if (thousands === null || thousands === undefined) {
				thousands = __thousands;
			}
	
			if (decimal === null || decimal === undefined) {
				decimal = __decimal;
			}
	
			return {
				display: function ( d ) {
					if ( typeof d !== 'number' && typeof d !== 'string' ) {
						return d;
					}
	
					if (d === '' || d === null) {
						return d;
					}
	
					var negative = d < 0 ? '-' : '';
					var flo = parseFloat( d );
					var abs = Math.abs(flo);
	
					// Scientific notation for large and small numbers
					if (abs >= 100000000000 || (abs < 0.0001 && abs !== 0) ) {
						var exp = flo.toExponential(precision).split(/e\+?/);
						return exp[0] + ' x 10<sup>' + exp[1] + '</sup>';
					}
	
					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if ( isNaN( flo ) ) {
						return _escapeHtml( d );
					}
	
					flo = flo.toFixed( precision );
					d = Math.abs( flo );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix||'');
				}
			};
		},
	
		text: function () {
			return {
				display: _escapeHtml,
				filter: _escapeHtml
			};
		}
	};
	
	
	var _extTypes = DataTable.ext.type;
	
	// Get / set type
	DataTable.type = function (name, prop, val) {
		if (! prop) {
			return {
				className: _extTypes.className[name],
				detect: _extTypes.detect.find(function (fn) {
					return fn._name === name;
				}),
				order: {
					pre: _extTypes.order[name + '-pre'],
					asc: _extTypes.order[name + '-asc'],
					desc: _extTypes.order[name + '-desc']
				},
				render: _extTypes.render[name],
				search: _extTypes.search[name]
			};
		}
	
		var setProp = function(prop, propVal) {
			_extTypes[prop][name] = propVal;
		};
		var setDetect = function (detect) {
			// `detect` can be a function or an object - we set a name
			// property for either - that is used for the detection
			Object.defineProperty(detect, "_name", {value: name});
	
			var idx = _extTypes.detect.findIndex(function (item) {
				return item._name === name;
			});
	
			if (idx === -1) {
				_extTypes.detect.unshift(detect);
			}
			else {
				_extTypes.detect.splice(idx, 1, detect);
			}
		};
		var setOrder = function (obj) {
			_extTypes.order[name + '-pre'] = obj.pre; // can be undefined
			_extTypes.order[name + '-asc'] = obj.asc; // can be undefined
			_extTypes.order[name + '-desc'] = obj.desc; // can be undefined
		};
	
		// prop is optional
		if (val === undefined) {
			val = prop;
			prop = null;
		}
	
		if (prop === 'className') {
			setProp('className', val);
		}
		else if (prop === 'detect') {
			setDetect(val);
		}
		else if (prop === 'order') {
			setOrder(val);
		}
		else if (prop === 'render') {
			setProp('render', val);
		}
		else if (prop === 'search') {
			setProp('search', val);
		}
		else if (! prop) {
			if (val.className) {
				setProp('className', val.className);
			}
	
			if (val.detect !== undefined) {
				setDetect(val.detect);
			}
	
			if (val.order) {
				setOrder(val.order);
			}
	
			if (val.render !== undefined) {
				setProp('render', val.render);
			}
	
			if (val.search !== undefined) {
				setProp('search', val.search);
			}
		}
	}
	
	// Get a list of types
	DataTable.types = function () {
		return _extTypes.detect.map(function (fn) {
			return fn._name;
		});
	};
	
	var __diacriticSort = function (a, b) {
		a = a !== null && a !== undefined ? a.toString().toLowerCase() : '';
		b = b !== null && b !== undefined ? b.toString().toLowerCase() : '';
	
		// Checked for `navigator.languages` support in `oneOf` so this code can't execute in old
		// Safari and thus can disable this check
		// eslint-disable-next-line compat/compat
		return a.localeCompare(b, navigator.languages[0] || navigator.language, {
			numeric: true,
			ignorePunctuation: true,
		});
	}
	
	var __diacriticHtmlSort = function (a, b) {
		a = _stripHtml(a);
		b = _stripHtml(b);
	
		return __diacriticSort(a, b);
	}
	
	//
	// Built in data types
	//
	
	DataTable.type('string', {
		detect: function () {
			return 'string';
		},
		order: {
			pre: function ( a ) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) && typeof a !== 'boolean' ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						! a.toString ?
							'' :
							a.toString();
			}
		},
		search: _filterString(false, true)
	});
	
	DataTable.type('string-utf8', {
		detect: {
			allOf: function ( d ) {
				return true;
			},
			oneOf: function ( d ) {
				// At least one data point must contain a non-ASCII character
				// This line will also check if navigator.languages is supported or not. If not (Safari 10.0-)
				// this data type won't be supported.
				// eslint-disable-next-line compat/compat
				return ! _empty( d ) && navigator.languages && typeof d === 'string' && d.match(/[^\x00-\x7F]/);
			}
		},
		order: {
			asc: __diacriticSort,
			desc: function (a, b) {
				return __diacriticSort(a, b) * -1;
			}
		},
		search: _filterString(false, true)
	});
	
	
	DataTable.type('html', {
		detect: {
			allOf: function ( d ) {
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1);
			},
			oneOf: function ( d ) {
				// At least one data point must contain a `<`
				return ! _empty( d ) && typeof d === 'string' && d.indexOf('<') !== -1;
			}
		},
		order: {
			pre: function ( a ) {
				return _empty(a) ?
					'' :
					a.replace ?
						_stripHtml(a).trim().toLowerCase() :
						a+'';
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-utf8', {
		detect: {
			allOf: function ( d ) {
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1);
			},
			oneOf: function ( d ) {
				// At least one data point must contain a `<` and a non-ASCII character
				// eslint-disable-next-line compat/compat
				return navigator.languages &&
					! _empty( d ) &&
					typeof d === 'string' &&
					d.indexOf('<') !== -1 &&
					typeof d === 'string' && d.match(/[^\x00-\x7F]/);
			}
		},
		order: {
			asc: __diacriticHtmlSort,
			desc: function (a, b) {
				return __diacriticHtmlSort(a, b) * -1;
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('date', {
		className: 'dt-type-date',
		detect: {
			allOf: function ( d ) {
				// V8 tries _very_ hard to make a string passed into `Date.parse()`
				// valid, so we need to use a regex to restrict date formats. Use a
				// plug-in for anything other than ISO8601 style strings
				if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
					return null;
				}
				var parsed = Date.parse(d);
				return (parsed !== null && !isNaN(parsed)) || _empty(d);
			},
			oneOf: function ( d ) {
				// At least one entry must be a date or a string with a date
				return (d instanceof Date) || (typeof d === 'string' && _re_date.test(d));
			}
		},
		order: {
			pre: function ( d ) {
				var ts = Date.parse( d );
				return isNaN(ts) ? -Infinity : ts;
			}
		}
	});
	
	
	DataTable.type('html-num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html, _re_formatted_numeric );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_formatted_numeric );
			}
		}
	});
	
	
	DataTable.type('num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, false );
			}
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp );
			}
		}
	});
	
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
		
		var type = typeof d;
	
		if (type === 'number' || type === 'bigint') {
			return d;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	$.extend( true, DataTable.ext.renderer, {
		footer: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.tfoot.cell);
			}
		},
	
		header: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.thead.cell);
	
				if (! settings.oFeatures.bSort) {
					cell.addClass(classes.order.none);
				}
	
				var legacyTop = settings.bSortCellsTop;
				var headerRows = cell.closest('thead').find('tr');
				var rowIdx = cell.parent().index();
	
				// Conditions to not apply the ordering icons
				if (
					// Cells and rows which have the attribute to disable the icons
					cell.attr('data-dt-order') === 'disable' ||
					cell.parent().attr('data-dt-order') === 'disable' ||
	
					// Legacy support for `orderCellsTop`. If it is set, then cells
					// which are not in the top or bottom row of the header (depending
					// on the value) do not get the sorting classes applied to them
					(legacyTop === true && rowIdx !== 0) ||
					(legacyTop === false && rowIdx !== headerRows.length - 1)
				) {
					return;
				}
	
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT column-visibility.dt.DT', function ( e, ctx ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var sorting = ctx.sortDetails;
	
					if (! sorting) {
						return;
					}
	
					var i;
					var orderClasses = classes.order;
					var columns = ctx.api.columns( cell );
					var col = settings.aoColumns[columns.flatten()[0]];
					var orderable = columns.orderable().includes(true);
					var ariaType = '';
					var indexes = columns.indexes();
					var sortDirs = columns.orderable(true).flatten();
					var orderedColumns = _pluck(sorting, 'col');
					var tabIndex = settings.iTabIndex;
	
					cell
						.removeClass(
							orderClasses.isAsc +' '+
							orderClasses.isDesc
						)
						.toggleClass( orderClasses.none, ! orderable )
						.toggleClass( orderClasses.canAsc, orderable && sortDirs.includes('asc') )
						.toggleClass( orderClasses.canDesc, orderable && sortDirs.includes('desc') );
	
					// Determine if all of the columns that this cell covers are included in the
					// current ordering
					var isOrdering = true;
					
					for (i=0; i<indexes.length; i++) {
						if (! orderedColumns.includes(indexes[i])) {
							isOrdering = false;
						}
					}
	
					if ( isOrdering ) {
						// Get the ordering direction for the columns under this cell
						// Note that it is possible for a cell to be asc and desc sorting
						// (column spanning cells)
						var orderDirs = columns.order();
	
						cell.addClass(
							orderDirs.includes('asc') ? orderClasses.isAsc : '' +
							orderDirs.includes('desc') ? orderClasses.isDesc : ''
						);
					}
	
					// Find the first visible column that has ordering applied to it - it get's
					// the aria information, as the ARIA spec says that only one column should
					// be marked with aria-sort
					var firstVis = -1; // column index
	
					for (i=0; i<orderedColumns.length; i++) {
						if (settings.aoColumns[orderedColumns[i]].bVisible) {
							firstVis = orderedColumns[i];
							break;
						}
					}
	
					if (indexes[0] == firstVis) {
						var firstSort = sorting[0];
						var sortOrder = col.asSorting;
	
						cell.attr('aria-sort', firstSort.dir === 'asc' ? 'ascending' : 'descending');
	
						// Determine if the next click will remove sorting or change the sort
						ariaType = ! sortOrder[firstSort.index + 1] ? 'Remove' : 'Reverse';
					}
					else {
						cell.removeAttr('aria-sort');
					}
	
					// Make the headers tab-able for keyboard navigation
					if (orderable) {
						var orderSpan = cell.find('.dt-column-order');
						
						orderSpan
							.attr('role', 'button')
							.attr('aria-label', orderable
								? col.ariaTitle + ctx.api.i18n('oAria.orderable' + ariaType)
								: col.ariaTitle
							);
	
						if (tabIndex !== -1) {
							orderSpan.attr('tabindex', tabIndex);
						}
					}
				} );
			}
		},
	
		layout: {
			_: function ( settings, container, items ) {
				var classes = settings.oClasses.layout;
				var row = $('<div/>')
					.attr('id', items.id || null)
					.addClass(items.className || classes.row)
					.appendTo( container );
	
				DataTable.ext.renderer.layout._forLayoutRow(items, function (key, val) {
					if (key === 'id' || key === 'className') {
						return;
					}
	
					var klass = '';
	
					if (val.table) {
						row.addClass(classes.tableRow);
						klass += classes.tableCell + ' ';
					}
	
					if (key === 'start') {
						klass += classes.start;
					}
					else if (key === 'end') {
						klass += classes.end;
					}
					else {
						klass += classes.full;
					}
	
					$('<div/>')
						.attr({
							id: val.id || null,
							"class": val.className
								? val.className
								: classes.cell + ' ' + klass
						})
						.append( val.contents )
						.appendTo( row );
				});
			},
	
			// Shared for use by the styling frameworks
			_forLayoutRow: function (items, fn) {
				// As we are inserting dom elements, we need start / end in a
				// specific order, this function is used for sorting the layout
				// keys.
				var layoutEnum = function (x) {
					switch (x) {
						case '': return 0;
						case 'start': return 1;
						case 'end': return 2;
						default: return 3;
					}
				};
	
				Object
					.keys(items)
					.sort(function (a, b) {
						return layoutEnum(a) - layoutEnum(b);
					})
					.forEach(function (key) {
						fn(key, items[key]);
					});
			}
		}
	} );
	
	
	DataTable.feature = {};
	
	// Third parameter is internal only!
	DataTable.feature.register = function ( name, cb, legacy ) {
		DataTable.ext.features[ name ] = cb;
	
		if (legacy) {
			_ext.feature.push({
				cFeature: legacy,
				fnInit: cb
			});
		}
	};
	
	function _divProp(el, prop, val) {
		if (val) {
			el[prop] = val;
		}
	}
	
	DataTable.feature.register( 'div', function ( settings, opts ) {
		var n = $('<div>')[0];
	
		if (opts) {
			_divProp(n, 'className', opts.className);
			_divProp(n, 'id', opts.id);
			_divProp(n, 'innerHTML', opts.html);
			_divProp(n, 'textContent', opts.text);
		}
	
		return n;
	} );
	
	DataTable.feature.register( 'info', function ( settings, opts ) {
		// For compatibility with the legacy `info` top level option
		if (! settings.oFeatures.bInfo) {
			return null;
		}
	
		var
			lang  = settings.oLanguage,
			tid = settings.sTableId,
			n = $('<div/>', {
				'class': settings.oClasses.info.container,
			} );
	
		opts = $.extend({
			callback: lang.fnInfoCallback,
			empty: lang.sInfoEmpty,
			postfix: lang.sInfoPostFix,
			search: lang.sInfoFiltered,
			text: lang.sInfo,
		}, opts);
	
	
		// Update display on each draw
		settings.aoDrawCallback.push(function (s) {
			_fnUpdateInfo(s, opts, n);
		});
	
		// For the first info display in the table, we add a callback and aria information.
		if (! settings._infoEl) {
			n.attr({
				'aria-live': 'polite',
				id: tid+'_info',
				role: 'status'
			});
	
			// Table is described by our info div
			$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
	
			settings._infoEl = n;
		}
	
		return n;
	}, 'i' );
	
	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo ( settings, opts, node )
	{
		var
			start = settings._iDisplayStart+1,
			end   = settings.fnDisplayEnd(),
			max   = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out   = total
				? opts.text
				: opts.empty;
	
		if ( total !== max ) {
			// Record set after filtering
			out += ' ' + opts.search;
		}
	
		// Convert the macros
		out += opts.postfix;
		out = _fnMacros( settings, out );
	
		if ( opts.callback ) {
			out = opts.callback.call( settings.oInstance,
				settings, start, end, max, total, out
			);
		}
	
		node.html( out );
	
		_fnCallbackFire(settings, null, 'info', [settings, node[0], out]);
	}
	
	var __searchCounter = 0;
	
	// opts
	// - text
	// - placeholder
	DataTable.feature.register( 'search', function ( settings, opts ) {
		// Don't show the input if filtering isn't available on the table
		if (! settings.oFeatures.bFilter) {
			return null;
		}
	
		var classes = settings.oClasses.search;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var input = '<input type="search" class="'+classes.input+'"/>';
	
		opts = $.extend({
			placeholder: language.sSearchPlaceholder,
			processing: false,
			text: language.sSearch
		}, opts);
	
		// The _INPUT_ is optional - is appended if not present
		if (opts.text.indexOf('_INPUT_') === -1) {
			opts.text += '_INPUT_';
		}
	
		opts.text = _fnMacros(settings, opts.text);
	
		// We can put the <input> outside of the label if it is at the start or end
		// which helps improve accessability (not all screen readers like implicit
		// for elements).
		var end = opts.text.match(/_INPUT_$/);
		var start = opts.text.match(/^_INPUT_/);
		var removed = opts.text.replace(/_INPUT_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_INPUT_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_INPUT_';
		}
	
		var filter = $('<div>')
			.addClass(classes.container)
			.append(str.replace(/_INPUT_/, input));
	
		// add for and id to label and input
		filter.find('label').attr('for', 'dt-search-' + __searchCounter);
		filter.find('input').attr('id', 'dt-search-' + __searchCounter);
		__searchCounter++;
	
		var searchFn = function(event) {
			var val = this.value;
	
			if(previousSearch.return && event.key !== "Enter") {
				return;
			}
	
			/* Now do the filter */
			if ( val != previousSearch.search ) {
				_fnProcessingRun(settings, opts.processing, function () {
					previousSearch.search = val;
			
					_fnFilterComplete( settings, previousSearch );
			
					// Need to redraw, without resorting
					settings._iDisplayStart = 0;
					_fnDraw( settings );
				});
			}
		};
	
		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			0;
	
		var jqFilter = $('input', filter)
			.val( previousSearch.search )
			.attr( 'placeholder', opts.placeholder )
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					DataTable.util.debounce( searchFn, searchDelay ) :
					searchFn
			)
			.on( 'mouseup.DT', function(e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout( function () {
					searchFn.call(jqFilter[0], e);
				}, 10);
			} )
			.on( 'keypress.DT', function(e) {
				/* Prevent form submission */
				if ( e.keyCode == 13 ) {
					return false;
				}
			} )
			.attr('aria-controls', tableId);
	
		// Update the input elements whenever the table is filtered
		$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
			if ( settings === s && jqFilter[0] !== document.activeElement ) {
				jqFilter.val( typeof previousSearch.search !== 'function'
					? previousSearch.search
					: ''
				);
			}
		} );
	
		return filter;
	}, 'f' );
	
	// opts
	// - type - button configuration
	// - buttons - number of buttons to show - must be odd
	DataTable.feature.register( 'paging', function ( settings, opts ) {
		// Don't show the paging input if the table doesn't have paging enabled
		if (! settings.oFeatures.bPaginate) {
			return null;
		}
	
		opts = $.extend({
			buttons: DataTable.ext.pager.numbers_length,
			type: settings.sPaginationType,
			boundaryNumbers: true,
			firstLast: true,
			previousNext: true,
			numbers: true
		}, opts);
	
		var host = $('<div/>')
			.addClass(settings.oClasses.paging.container + (opts.type ? ' paging_' + opts.type : ''))
			.append(
				$('<nav>')
					.attr('aria-label', 'pagination')
					.addClass(settings.oClasses.paging.nav)
			);
		var draw = function () {
			_pagingDraw(settings, host.children(), opts);
		};
	
		settings.aoDrawCallback.push(draw);
	
		// Responsive redraw of paging control
		$(settings.nTable).on('column-sizing.dt.DT', draw);
	
		return host;
	}, 'p' );
	
	/**
	 * Dynamically create the button type array based on the configuration options.
	 * This will only happen if the paging type is not defined.
	 */
	function _pagingDynamic(opts) {
		var out = [];
	
		if (opts.numbers) {
			out.push('numbers');
		}
	
		if (opts.previousNext) {
			out.unshift('previous');
			out.push('next');
		}
	
		if (opts.firstLast) {
			out.unshift('first');
			out.push('last');
		}
	
		return out;
	}
	
	function _pagingDraw(settings, host, opts) {
		if (! settings._bInitComplete) {
			return;
		}
	
		var
			plugin = opts.type
				? DataTable.ext.pager[ opts.type ]
				: _pagingDynamic,
			aria = settings.oLanguage.oAria.paginate || {},
			start      = settings._iDisplayStart,
			len        = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1,
			page = all ? 0 : Math.ceil( start / len ),
			pages = all ? 1 : Math.ceil( visRecords / len ),
			buttons = [],
			buttonEls = [],
			buttonsNested = plugin(opts)
				.map(function (val) {
					return val === 'numbers'
						? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers)
						: val;
				});
	
		// .flat() would be better, but not supported in old Safari
		buttons = buttons.concat.apply(buttons, buttonsNested);
	
		for (var i=0 ; i<buttons.length ; i++) {
			var button = buttons[i];
	
			var btnInfo = _pagingButtonInfo(settings, button, page, pages);
			var btn = _fnRenderer( settings, 'pagingButton' )(
				settings,
				button,
				btnInfo.display,
				btnInfo.active,
				btnInfo.disabled
			);
	
			var ariaLabel = typeof button === 'string'
				? aria[ button ]
				: aria.number
					? aria.number + (button+1)
					: null;
	
			// Common attributes
			$(btn.clicker).attr({
				'aria-controls': settings.sTableId,
				'aria-disabled': btnInfo.disabled ? 'true' : null,
				'aria-current': btnInfo.active ? 'page' : null,
				'aria-label': ariaLabel,
				'data-dt-idx': button,
				'tabIndex': btnInfo.disabled
					? -1
					: settings.iTabIndex && btn.clicker[0].nodeName.toLowerCase() !== 'span'
						? settings.iTabIndex
						: null, // `0` doesn't need a tabIndex since it is the default
			});
	
			if (typeof button !== 'number') {
				$(btn.clicker).addClass(button);
			}
	
			_fnBindAction(
				btn.clicker, {action: button}, function(e) {
					e.preventDefault();
	
					_fnPageChange( settings, e.data.action, true );
				}
			);
	
			buttonEls.push(btn.display);
		}
	
		var wrapped = _fnRenderer(settings, 'pagingContainer')(
			settings, buttonEls
		);
	
		var activeEl = host.find(document.activeElement).data('dt-idx');
	
		host.empty().append(wrapped);
	
		if ( activeEl !== undefined ) {
			host.find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
		}
	
		// Responsive - check if the buttons are over two lines based on the
		// height of the buttons and the container.
		if (buttonEls.length) {
			var outerHeight = $(buttonEls[0]).outerHeight();
		
			if (
				opts.buttons > 1 && // prevent infinite
				outerHeight > 0 && // will be 0 if hidden
				$(host).height() >= (outerHeight * 2) - 10
			) {
				_pagingDraw(settings, host, $.extend({}, opts, { buttons: opts.buttons - 2 }));
			}
		}
	}
	
	/**
	 * Get properties for a button based on the current paging state of the table
	 *
	 * @param {*} settings DT settings object
	 * @param {*} button The button type in question
	 * @param {*} page Table's current page
	 * @param {*} pages Number of pages
	 * @returns Info object
	 */
	function _pagingButtonInfo(settings, button, page, pages) {
		var lang = settings.oLanguage.oPaginate;
		var o = {
			display: '',
			active: false,
			disabled: false
		};
	
		switch ( button ) {
			case 'ellipsis':
				o.display = '&#x2026;';
				break;
	
			case 'first':
				o.display = lang.sFirst;
	
				if (page === 0) {
					o.disabled = true;
				}
				break;
	
			case 'previous':
				o.display = lang.sPrevious;
	
				if ( page === 0 ) {
					o.disabled = true;
				}
				break;
	
			case 'next':
				o.display = lang.sNext;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			case 'last':
				o.display = lang.sLast;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			default:
				if ( typeof button === 'number' ) {
					o.display = settings.fnFormatNumber( button + 1 );
					
					if (page === button) {
						o.active = true;
					}
				}
				break;
		}
	
		return o;
	}
	
	/**
	 * Compute what number buttons to show in the paging control
	 *
	 * @param {*} page Current page
	 * @param {*} pages Total number of pages
	 * @param {*} buttons Target number of number buttons
	 * @param {boolean} addFirstLast Indicate if page 1 and end should be included
	 * @returns Buttons to show
	 */
	function _pagingNumbers ( page, pages, buttons, addFirstLast ) {
		var
			numbers = [],
			half = Math.floor(buttons / 2),
			before = addFirstLast ? 2 : 1,
			after = addFirstLast ? 1 : 0;
	
		if ( pages <= buttons ) {
			numbers = _range(0, pages);
		}
		else if (buttons === 1) {
			// Single button - current page only
			numbers = [page];
		}
		else if (buttons === 3) {
			// Special logic for just three buttons
			if (page <= 1) {
				numbers = [0, 1, 'ellipsis'];
			}
			else if (page >= pages - 2) {
				numbers = _range(pages-2, pages);
				numbers.unshift('ellipsis');
			}
			else {
				numbers = ['ellipsis', page, 'ellipsis'];
			}
		}
		else if ( page <= half ) {
			numbers = _range(0, buttons-before);
			numbers.push('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
			}
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range(pages-(buttons-before), pages);
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.unshift(0);
			}
		}
		else {
			numbers = _range(page-half+before, page+half-after);
			numbers.push('ellipsis');
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
				numbers.unshift(0);
			}
		}
	
		return numbers;
	}
	
	var __lengthCounter = 0;
	
	// opts
	// - menu
	// - text
	DataTable.feature.register( 'pageLength', function ( settings, opts ) {
		var features = settings.oFeatures;
	
		// For compatibility with the legacy `pageLength` top level option
		if (! features.bPaginate || ! features.bLengthChange) {
			return null;
		}
	
		opts = $.extend({
			menu: settings.aLengthMenu,
			text: settings.oLanguage.sLengthMenu
		}, opts);
	
		var
			classes  = settings.oClasses.length,
			tableId  = settings.sTableId,
			menu     = opts.menu,
			lengths  = [],
			language = [],
			i;
	
		// Options can be given in a number of ways
		if (Array.isArray( menu[0] )) {
			// Old 1.x style - 2D array
			lengths = menu[0];
			language = menu[1];
		}
		else {
			for ( i=0 ; i<menu.length ; i++ ) {
				// An object with different label and value
				if ($.isPlainObject(menu[i])) {
					lengths.push(menu[i].value);
					language.push(menu[i].label);
				}
				else {
					// Or just a number to display and use
					lengths.push(menu[i]);
					language.push(menu[i]);
				}
			}
		}
	
		// We can put the <select> outside of the label if it is at the start or
		// end which helps improve accessability (not all screen readers like
		// implicit for elements).
		var end = opts.text.match(/_MENU_$/);
		var start = opts.text.match(/^_MENU_/);
		var removed = opts.text.replace(/_MENU_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_MENU_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_MENU_';
		}
	
		// Wrapper element - use a span as a holder for where the select will go
		var tmpId = 'tmp-' + (+new Date())
		var div = $('<div/>')
			.addClass( classes.container )
			.append(
				str.replace( '_MENU_', '<span id="'+tmpId+'"></span>' )
			);
	
		// Save text node content for macro updating
		var textNodes = [];
		Array.prototype.slice.call(div.find('label')[0].childNodes).forEach(function (el) {
			if (el.nodeType === Node.TEXT_NODE) {
				textNodes.push({
					el: el,
					text: el.textContent
				});
			}
		});
	
		// Update the label text in case it has an entries value
		var updateEntries = function (len) {
			textNodes.forEach(function (node) {
				node.el.textContent = _fnMacros(settings, node.text, len);
			});
		}
	
		// Next, the select itself, along with the options
		var select = $('<select/>', {
			'aria-controls': tableId,
			'class':         classes.select
		} );
	
		for ( i=0 ; i<lengths.length ; i++ ) {
			select[0][ i ] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber( language[i] ) :
					language[i],
				lengths[i]
			);
		}
	
		// add for and id to label and input
		div.find('label').attr('for', 'dt-length-' + __lengthCounter);
		select.attr('id', 'dt-length-' + __lengthCounter);
		__lengthCounter++;
	
		// Swap in the select list
		div.find('#' + tmpId).replaceWith(select);
	
		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val( settings._iDisplayLength )
			.on( 'change.DT', function() {
				_fnLengthChange( settings, $(this).val() );
				_fnDraw( settings );
			} );
	
		// Update node value whenever anything changes the table's length
		$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
			if ( settings === s ) {
				$('select', div).val( len );
	
				// Resolve plurals in the text for the new length
				updateEntries(len);
			}
		} );
	
		updateEntries(settings._iDisplayLength);
	
		return div;
	}, 'l' );
	
	// jQuery access
	$.fn.dataTable = DataTable;
	
	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;
	
	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;
	
	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};
	
	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );

	return DataTable;
}));


/*! DataTables Bootstrap 5 integration
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * DataTables integration for Bootstrap 5.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See https://datatables.net/manual/styling/bootstrap
 * for further information.
 */

/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( true, DataTable.ext.classes, {
	container: "dt-container dt-bootstrap5",
	search: {
		input: "form-control form-control-sm"
	},
	length: {
		select: "form-select form-select-sm"
	},
	processing: {
		container: "dt-processing card"
	},
	layout: {
		row: 'row mt-2 justify-content-between',
		cell: 'd-md-flex justify-content-between align-items-center',
		tableCell: 'col-12',
		start: 'dt-layout-start col-md-auto me-auto',
		end: 'dt-layout-end col-md-auto ms-auto',
		full: 'dt-layout-full col-md'
	}
} );


/* Bootstrap paging button renderer */
DataTable.ext.renderer.pagingButton.bootstrap = function (settings, buttonType, content, active, disabled) {
	var btnClasses = ['dt-paging-button', 'page-item'];

	if (active) {
		btnClasses.push('active');
	}

	if (disabled) {
		btnClasses.push('disabled')
	}

	var li = $('<li>').addClass(btnClasses.join(' '));
	var a = $('<button>', {
		'class': 'page-link',
		role: 'link',
		type: 'button'
	})
		.html(content)
		.appendTo(li);

	return {
		display: li,
		clicker: a
	};
};

DataTable.ext.renderer.pagingContainer.bootstrap = function (settings, buttonEls) {
	return $('<ul/>').addClass('pagination').append(buttonEls);
};


return DataTable;
}));


/*! Buttons for DataTables 3.2.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



// Used for namespacing events added to the document by each instance, so they
// can be removed on destroy
var _instCounter = 0;

// Button namespacing counter for namespacing events on individual buttons
var _buttonCounter = 0;

var _dtButtons = DataTable.ext.buttons;

// Custom entity decoder for data export
var _entityDecoder = null;

// Allow for jQuery slim
function _fadeIn(el, duration, fn) {
	if ($.fn.animate) {
		el.stop().fadeIn(duration, fn);
	}
	else {
		el.css('display', 'block');

		if (fn) {
			fn.call(el);
		}
	}
}

function _fadeOut(el, duration, fn) {
	if ($.fn.animate) {
		el.stop().fadeOut(duration, fn);
	}
	else {
		el.css('display', 'none');

		if (fn) {
			fn.call(el);
		}
	}
}

/**
 * [Buttons description]
 * @param {[type]}
 * @param {[type]}
 */
var Buttons = function (dt, config) {
	if (!DataTable.versionCheck('2')) {
		throw 'Warning: Buttons requires DataTables 2 or newer';
	}

	// If not created with a `new` keyword then we return a wrapper function that
	// will take the settings object for a DT. This allows easy use of new instances
	// with the `layout` option - e.g. `topLeft: $.fn.dataTable.Buttons( ... )`.
	if (!(this instanceof Buttons)) {
		return function (settings) {
			return new Buttons(settings, dt).container();
		};
	}

	// If there is no config set it to an empty object
	if (typeof config === 'undefined') {
		config = {};
	}

	// Allow a boolean true for defaults
	if (config === true) {
		config = {};
	}

	// For easy configuration of buttons an array can be given
	if (Array.isArray(config)) {
		config = { buttons: config };
	}

	this.c = $.extend(true, {}, Buttons.defaults, config);

	// Don't want a deep copy for the buttons
	if (config.buttons) {
		this.c.buttons = config.buttons;
	}

	this.s = {
		dt: new DataTable.Api(dt),
		buttons: [],
		listenKeys: '',
		namespace: 'dtb' + _instCounter++
	};

	this.dom = {
		container: $('<' + this.c.dom.container.tag + '/>').addClass(
			this.c.dom.container.className
		)
	};

	this._constructor();
};

$.extend(Buttons.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods
	 */

	/**
	 * Get the action of a button
	 * @param  {int|string} Button index
	 * @return {function}
	 */ /**
	 * Set the action of a button
	 * @param  {node} node Button element
	 * @param  {function} action Function to set
	 * @return {Buttons} Self for chaining
	 */
	action: function (node, action) {
		var button = this._nodeToButton(node);

		if (action === undefined) {
			return button.conf.action;
		}

		button.conf.action = action;

		return this;
	},

	/**
	 * Add an active class to the button to make to look active or get current
	 * active state.
	 * @param  {node} node Button element
	 * @param  {boolean} [flag] Enable / disable flag
	 * @return {Buttons} Self for chaining or boolean for getter
	 */
	active: function (node, flag) {
		var button = this._nodeToButton(node);
		var klass = this.c.dom.button.active;
		var jqNode = $(button.node);

		if (
			button.inCollection &&
			this.c.dom.collection.button &&
			this.c.dom.collection.button.active !== undefined
		) {
			klass = this.c.dom.collection.button.active;
		}

		if (flag === undefined) {
			return jqNode.hasClass(klass);
		}

		jqNode.toggleClass(klass, flag === undefined ? true : flag);

		return this;
	},

	/**
	 * Add a new button
	 * @param {object} config Button configuration object, base string name or function
	 * @param {int|string} [idx] Button index for where to insert the button
	 * @param {boolean} [draw=true] Trigger a draw. Set a false when adding
	 *   lots of buttons, until the last button.
	 * @return {Buttons} Self for chaining
	 */
	add: function (config, idx, draw) {
		var buttons = this.s.buttons;

		if (typeof idx === 'string') {
			var split = idx.split('-');
			var base = this.s;

			for (var i = 0, ien = split.length - 1; i < ien; i++) {
				base = base.buttons[split[i] * 1];
			}

			buttons = base.buttons;
			idx = split[split.length - 1] * 1;
		}

		this._expandButton(
			buttons,
			config,
			config !== undefined ? config.split : undefined,
			(config === undefined ||
				config.split === undefined ||
				config.split.length === 0) &&
				base !== undefined,
			false,
			idx
		);

		if (draw === undefined || draw === true) {
			this._draw();
		}

		return this;
	},

	/**
	 * Clear buttons from a collection and then insert new buttons
	 */
	collectionRebuild: function (node, newButtons) {
		var button = this._nodeToButton(node);

		if (newButtons !== undefined) {
			var i;
			// Need to reverse the array
			for (i = button.buttons.length - 1; i >= 0; i--) {
				this.remove(button.buttons[i].node);
			}

			// If the collection has prefix and / or postfix buttons we need to add them in
			if (button.conf.prefixButtons) {
				newButtons.unshift.apply(newButtons, button.conf.prefixButtons);
			}

			if (button.conf.postfixButtons) {
				newButtons.push.apply(newButtons, button.conf.postfixButtons);
			}

			for (i = 0; i < newButtons.length; i++) {
				var newBtn = newButtons[i];

				this._expandButton(
					button.buttons,
					newBtn,
					newBtn !== undefined &&
						newBtn.config !== undefined &&
						newBtn.config.split !== undefined,
					true,
					newBtn.parentConf !== undefined &&
						newBtn.parentConf.split !== undefined,
					null,
					newBtn.parentConf
				);
			}
		}

		this._draw(button.collection, button.buttons);
	},

	/**
	 * Get the container node for the buttons
	 * @return {jQuery} Buttons node
	 */
	container: function () {
		return this.dom.container;
	},

	/**
	 * Disable a button
	 * @param  {node} node Button node
	 * @return {Buttons} Self for chaining
	 */
	disable: function (node) {
		var button = this._nodeToButton(node);

		if (button.isSplit) {
			$(button.node.childNodes[0])
				.addClass(this.c.dom.button.disabled)
				.prop('disabled', true);
		}
		else {
			$(button.node)
				.addClass(this.c.dom.button.disabled)
				.prop('disabled', true);
		}

		button.disabled = true;

		this._checkSplitEnable();

		return this;
	},

	/**
	 * Destroy the instance, cleaning up event handlers and removing DOM
	 * elements
	 * @return {Buttons} Self for chaining
	 */
	destroy: function () {
		// Key event listener
		$('body').off('keyup.' + this.s.namespace);

		// Individual button destroy (so they can remove their own events if
		// needed). Take a copy as the array is modified by `remove`
		var buttons = this.s.buttons.slice();
		var i, ien;

		for (i = 0, ien = buttons.length; i < ien; i++) {
			this.remove(buttons[i].node);
		}

		// Container
		this.dom.container.remove();

		// Remove from the settings object collection
		var buttonInsts = this.s.dt.settings()[0];

		for (i = 0, ien = buttonInsts.length; i < ien; i++) {
			if (buttonInsts.inst === this) {
				buttonInsts.splice(i, 1);
				break;
			}
		}

		return this;
	},

	/**
	 * Enable / disable a button
	 * @param  {node} node Button node
	 * @param  {boolean} [flag=true] Enable / disable flag
	 * @return {Buttons} Self for chaining
	 */
	enable: function (node, flag) {
		if (flag === false) {
			return this.disable(node);
		}

		var button = this._nodeToButton(node);

		if (button.isSplit) {
			$(button.node.childNodes[0])
				.removeClass(this.c.dom.button.disabled)
				.prop('disabled', false);
		}
		else {
			$(button.node)
				.removeClass(this.c.dom.button.disabled)
				.prop('disabled', false);
		}

		button.disabled = false;

		this._checkSplitEnable();

		return this;
	},

	/**
	 * Get a button's index
	 *
	 * This is internally recursive
	 * @param {element} node Button to get the index of
	 * @return {string} Button index
	 */
	index: function (node, nested, buttons) {
		if (!nested) {
			nested = '';
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			var inner = buttons[i].buttons;

			if (buttons[i].node === node) {
				return nested + i;
			}

			if (inner && inner.length) {
				var match = this.index(node, i + '-', inner);

				if (match !== null) {
					return match;
				}
			}
		}

		return null;
	},

	/**
	 * Get the instance name for the button set selector
	 * @return {string} Instance name
	 */
	name: function () {
		return this.c.name;
	},

	/**
	 * Get a button's node of the buttons container if no button is given
	 * @param  {node} [node] Button node
	 * @return {jQuery} Button element, or container
	 */
	node: function (node) {
		if (!node) {
			return this.dom.container;
		}

		var button = this._nodeToButton(node);
		return $(button.node);
	},

	/**
	 * Set / get a processing class on the selected button
	 * @param {element} node Triggering button node
	 * @param  {boolean} flag true to add, false to remove, undefined to get
	 * @return {boolean|Buttons} Getter value or this if a setter.
	 */
	processing: function (node, flag) {
		var dt = this.s.dt;
		var button = this._nodeToButton(node);

		if (flag === undefined) {
			return $(button.node).hasClass('processing');
		}

		$(button.node).toggleClass('processing', flag);

		$(dt.table().node()).triggerHandler('buttons-processing.dt', [
			flag,
			dt.button(node),
			dt,
			$(node),
			button.conf
		]);

		return this;
	},

	/**
	 * Remove a button.
	 * @param  {node} node Button node
	 * @return {Buttons} Self for chaining
	 */
	remove: function (node) {
		var button = this._nodeToButton(node);
		var host = this._nodeToHost(node);
		var dt = this.s.dt;

		// Remove any child buttons first
		if (button.buttons.length) {
			for (var i = button.buttons.length - 1; i >= 0; i--) {
				this.remove(button.buttons[i].node);
			}
		}

		button.conf.destroying = true;

		// Allow the button to remove event handlers, etc
		if (button.conf.destroy) {
			button.conf.destroy.call(dt.button(node), dt, $(node), button.conf);
		}

		this._removeKey(button.conf);

		$(button.node).remove();

		var idx = $.inArray(button, host);
		host.splice(idx, 1);

		return this;
	},

	/**
	 * Get the text for a button
	 * @param  {int|string} node Button index
	 * @return {string} Button text
	 */ /**
	 * Set the text for a button
	 * @param  {int|string|function} node Button index
	 * @param  {string} label Text
	 * @return {Buttons} Self for chaining
	 */
	text: function (node, label) {
		var button = this._nodeToButton(node);
		var textNode = button.textNode;
		var dt = this.s.dt;
		var jqNode = $(button.node);
		var text = function (opt) {
			return typeof opt === 'function'
				? opt(dt, jqNode, button.conf)
				: opt;
		};

		if (label === undefined) {
			return text(button.conf.text);
		}

		button.conf.text = label;
		textNode.html(text(label));

		return this;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Buttons constructor
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var dtSettings = dt.settings()[0];
		var buttons = this.c.buttons;

		if (!dtSettings._buttons) {
			dtSettings._buttons = [];
		}

		dtSettings._buttons.push({
			inst: this,
			name: this.c.name
		});

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			this.add(buttons[i]);
		}

		dt.on('destroy', function (e, settings) {
			if (settings === dtSettings) {
				that.destroy();
			}
		});

		// Global key event binding to listen for button keys
		$('body').on('keyup.' + this.s.namespace, function (e) {
			if (
				!document.activeElement ||
				document.activeElement === document.body
			) {
				// SUse a string of characters for fast lookup of if we need to
				// handle this
				var character = String.fromCharCode(e.keyCode).toLowerCase();

				if (that.s.listenKeys.toLowerCase().indexOf(character) !== -1) {
					that._keypress(character, e);
				}
			}
		});
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Add a new button to the key press listener
	 * @param {object} conf Resolved button configuration object
	 * @private
	 */
	_addKey: function (conf) {
		if (conf.key) {
			this.s.listenKeys += $.isPlainObject(conf.key)
				? conf.key.key
				: conf.key;
		}
	},

	/**
	 * Insert the buttons into the container. Call without parameters!
	 * @param  {node} [container] Recursive only - Insert point
	 * @param  {array} [buttons] Recursive only - Buttons array
	 * @private
	 */
	_draw: function (container, buttons) {
		if (!container) {
			container = this.dom.container;
			buttons = this.s.buttons;
		}

		container.children().detach();

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			container.append(buttons[i].inserter);
			container.append(' ');

			if (buttons[i].buttons && buttons[i].buttons.length) {
				this._draw(buttons[i].collection, buttons[i].buttons);
			}
		}
	},

	/**
	 * Create buttons from an array of buttons
	 * @param  {array} attachTo Buttons array to attach to
	 * @param  {object} button Button definition
	 * @param  {boolean} inCollection true if the button is in a collection
	 * @private
	 */
	_expandButton: function (
		attachTo,
		button,
		split,
		inCollection,
		inSplit,
		attachPoint,
		parentConf
	) {
		var dt = this.s.dt;
		var isSplit = false;
		var domCollection = this.c.dom.collection;
		var buttons = !Array.isArray(button) ? [button] : button;

		if (button === undefined) {
			buttons = !Array.isArray(split) ? [split] : split;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			var conf = this._resolveExtends(buttons[i]);

			if (!conf) {
				continue;
			}

			isSplit = conf.config && conf.config.split ? true : false;

			// If the configuration is an array, then expand the buttons at this
			// point
			if (Array.isArray(conf)) {
				this._expandButton(
					attachTo,
					conf,
					built !== undefined && built.conf !== undefined
						? built.conf.split
						: undefined,
					inCollection,
					parentConf !== undefined && parentConf.split !== undefined,
					attachPoint,
					parentConf
				);
				continue;
			}

			var built = this._buildButton(
				conf,
				inCollection,
				conf.split !== undefined ||
					(conf.config !== undefined &&
						conf.config.split !== undefined),
				inSplit
			);
			if (!built) {
				continue;
			}

			if (attachPoint !== undefined && attachPoint !== null) {
				attachTo.splice(attachPoint, 0, built);
				attachPoint++;
			}
			else {
				attachTo.push(built);
			}

			// Any button type can have a drop icon set
			if (built.conf.dropIcon && ! built.conf.split) {
				$(built.node)
					.addClass(this.c.dom.button.dropClass)
					.append(this.c.dom.button.dropHtml);
			}

			// Create the dropdown for a collection
			if (built.conf.buttons) {
				built.collection = $(
					'<' + domCollection.container.content.tag + '/>'
				);
				built.conf._collection = built.collection;

				this._expandButton(
					built.buttons,
					built.conf.buttons,
					built.conf.split,
					!isSplit,
					isSplit,
					attachPoint,
					built.conf
				);
			}

			// And the split collection
			if (built.conf.split) {
				built.collection = $('<' + domCollection.container.tag + '/>');
				built.conf._collection = built.collection;

				for (var j = 0; j < built.conf.split.length; j++) {
					var item = built.conf.split[j];

					if (typeof item === 'object') {
						item.parent = parentConf;

						if (item.collectionLayout === undefined) {
							item.collectionLayout = built.conf.collectionLayout;
						}

						if (item.dropup === undefined) {
							item.dropup = built.conf.dropup;
						}

						if (item.fade === undefined) {
							item.fade = built.conf.fade;
						}
					}
				}

				this._expandButton(
					built.buttons,
					built.conf.buttons,
					built.conf.split,
					!isSplit,
					isSplit,
					attachPoint,
					built.conf
				);
			}

			built.conf.parent = parentConf;

			// init call is made here, rather than buildButton as it needs to
			// be selectable, and for that it needs to be in the buttons array
			if (conf.init) {
				conf.init.call(dt.button(built.node), dt, $(built.node), conf);
			}
		}
	},

	/**
	 * Create an individual button
	 * @param  {object} config            Resolved button configuration
	 * @param  {boolean} inCollection `true` if a collection button
	 * @return {object} Completed button description object
	 * @private
	 */
	_buildButton: function (config, inCollection, isSplit, inSplit) {
		var that = this;
		var configDom = this.c.dom;
		var textNode;
		var dt = this.s.dt;
		var text = function (opt) {
			return typeof opt === 'function' ? opt(dt, button, config) : opt;
		};

		// Create an object that describes the button which can be in `dom.button`, or
		// `dom.collection.button` or `dom.split.button` or `dom.collection.split.button`!
		// Each should extend from `dom.button`.
		var dom = $.extend(true, {}, configDom.button);

		if (inCollection && isSplit && configDom.collection.split) {
			$.extend(true, dom, configDom.collection.split.action);
		}
		else if (inSplit || inCollection) {
			$.extend(true, dom, configDom.collection.button);
		}
		else if (isSplit) {
			$.extend(true, dom, configDom.split.button);
		}

		// Spacers don't do much other than insert an element into the DOM
		if (config.spacer) {
			var spacer = $('<' + dom.spacer.tag + '/>')
				.addClass(
					'dt-button-spacer ' +
						config.style +
						' ' +
						dom.spacer.className
				)
				.html(text(config.text));

			return {
				conf: config,
				node: spacer,
				inserter: spacer,
				buttons: [],
				inCollection: inCollection,
				isSplit: isSplit,
				collection: null,
				textNode: spacer
			};
		}

		// Make sure that the button is available based on whatever requirements
		// it has. For example, PDF button require pdfmake
		if (
			config.available &&
			!config.available(dt, config) &&
			!config.html
		) {
			return false;
		}

		var button;

		if (!config.html) {
			var run = function (e, dt, button, config, done) {
				config.action.call(dt.button(button), e, dt, button, config, done);

				$(dt.table().node()).triggerHandler('buttons-action.dt', [
					dt.button(button),
					dt,
					button,
					config
				]);
			};

			var action = function(e, dt, button, config) {
				if (config.async) {
					that.processing(button[0], true);

					setTimeout(function () {
						run(e, dt, button, config, function () {
							that.processing(button[0], false);
						});
					}, config.async);
				}
				else {
					run(e, dt, button, config, function () {});
				}
			};

			var tag = config.tag || dom.tag;
			var clickBlurs =
				config.clickBlurs === undefined ? true : config.clickBlurs;

			button = $('<' + tag + '/>')
				.addClass(dom.className)
				.attr('tabindex', this.s.dt.settings()[0].iTabIndex)
				.attr('aria-controls', this.s.dt.table().node().id)
				.on('click.dtb', function (e) {
					e.preventDefault();

					if (!button.hasClass(dom.disabled) && config.action) {
						action(e, dt, button, config);
					}

					if (clickBlurs) {
						button.trigger('blur');
					}
				})
				.on('keypress.dtb', function (e) {
					if (e.keyCode === 13) {
						e.preventDefault();

						if (!button.hasClass(dom.disabled) && config.action) {
							action(e, dt, button, config);
						}
					}
				});

			// Make `a` tags act like a link
			if (tag.toLowerCase() === 'a') {
				button.attr('href', '#');
			}

			// Button tags should have `type=button` so they don't have any default behaviour
			if (tag.toLowerCase() === 'button') {
				button.attr('type', 'button');
			}

			if (dom.liner.tag) {
				var liner = $('<' + dom.liner.tag + '/>')
					.html(text(config.text))
					.addClass(dom.liner.className);

				if (dom.liner.tag.toLowerCase() === 'a') {
					liner.attr('href', '#');
				}

				button.append(liner);
				textNode = liner;
			}
			else {
				button.html(text(config.text));
				textNode = button;
			}

			if (config.enabled === false) {
				button.addClass(dom.disabled);
			}

			if (config.className) {
				button.addClass(config.className);
			}

			if (config.titleAttr) {
				button.attr('title', text(config.titleAttr));
			}

			if (config.attr) {
				button.attr(config.attr);
			}

			if (!config.namespace) {
				config.namespace = '.dt-button-' + _buttonCounter++;
			}

			if (config.config !== undefined && config.config.split) {
				config.split = config.config.split;
			}
		}
		else {
			button = $(config.html);
		}

		var buttonContainer = this.c.dom.buttonContainer;
		var inserter;
		if (buttonContainer && buttonContainer.tag) {
			inserter = $('<' + buttonContainer.tag + '/>')
				.addClass(buttonContainer.className)
				.append(button);
		}
		else {
			inserter = button;
		}

		this._addKey(config);

		// Style integration callback for DOM manipulation
		// Note that this is _not_ documented. It is currently
		// for style integration only
		if (this.c.buttonCreated) {
			inserter = this.c.buttonCreated(config, inserter);
		}

		var splitDiv;

		if (isSplit) {
			var dropdownConf = inCollection
				? $.extend(true, this.c.dom.split, this.c.dom.collection.split)
				: this.c.dom.split;
			var wrapperConf = dropdownConf.wrapper;

			splitDiv = $('<' + wrapperConf.tag + '/>')
				.addClass(wrapperConf.className)
				.append(button);

			var dropButtonConfig = $.extend(config, {
				autoClose: true,
				align: dropdownConf.dropdown.align,
				attr: {
					'aria-haspopup': 'dialog',
					'aria-expanded': false
				},
				className: dropdownConf.dropdown.className,
				closeButton: false,
				splitAlignClass: dropdownConf.dropdown.splitAlignClass,
				text: dropdownConf.dropdown.text
			});

			this._addKey(dropButtonConfig);

			var splitAction = function (e, dt, button, config) {
				_dtButtons.split.action.call(
					dt.button(splitDiv),
					e,
					dt,
					button,
					config
				);

				$(dt.table().node()).triggerHandler('buttons-action.dt', [
					dt.button(button),
					dt,
					button,
					config
				]);
				button.attr('aria-expanded', true);
			};

			var dropButton = $(
				'<button class="' +
					dropdownConf.dropdown.className +
					' dt-button"></button>'
			)
				.html(this.c.dom.button.dropHtml)
				.addClass(this.c.dom.button.dropClass)
				.on('click.dtb', function (e) {
					e.preventDefault();
					e.stopPropagation();

					if (!dropButton.hasClass(dom.disabled)) {
						splitAction(e, dt, dropButton, dropButtonConfig);
					}
					if (clickBlurs) {
						dropButton.trigger('blur');
					}
				})
				.on('keypress.dtb', function (e) {
					if (e.keyCode === 13) {
						e.preventDefault();

						if (!dropButton.hasClass(dom.disabled)) {
							splitAction(e, dt, dropButton, dropButtonConfig);
						}
					}
				});

			if (config.split.length === 0) {
				dropButton.addClass('dtb-hide-drop');
			}

			splitDiv.append(dropButton).attr(dropButtonConfig.attr);
		}

		return {
			conf: config,
			node: isSplit ? splitDiv.get(0) : button.get(0),
			inserter: isSplit ? splitDiv : inserter,
			buttons: [],
			inCollection: inCollection,
			isSplit: isSplit,
			inSplit: inSplit,
			collection: null,
			textNode: textNode
		};
	},

	/**
	 * Spin over buttons checking if splits should be enabled or not.
	 * @param {*} buttons Array of buttons to check
	 */
	_checkSplitEnable: function (buttons) {
		if (! buttons) {
			buttons = this.s.buttons;
		}

		for (var i=0 ; i<buttons.length ; i++) {
			var button = buttons[i];

			// Check if the button is a split one and if so, determine
			// its state
			if (button.isSplit) {
				var splitBtn = button.node.childNodes[1];

				if (this._checkAnyEnabled(button.buttons)) {
					// Enable the split
					$(splitBtn)
						.removeClass(this.c.dom.button.disabled)
						.prop('disabled', false);
				}
				else {
					$(splitBtn)
						.addClass(this.c.dom.button.disabled)
						.prop('disabled', false);
				}
			}
			else if (button.isCollection) {
				// Nest down into collections
				this._checkSplitEnable(button.buttons);
			}
		}
	},

	/**
	 * Check an array of buttons and see if any are enabled in it
	 * @param {*} buttons Button array
	 * @returns true if a button is enabled, false otherwise
	 */
	_checkAnyEnabled: function (buttons) {
		for (var i=0 ; i<buttons.length ; i++) {
			if (! buttons[i].disabled) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Get the button object from a node (recursive)
	 * @param  {node} node Button node
	 * @param  {array} [buttons] Button array, uses base if not defined
	 * @return {object} Button object
	 * @private
	 */
	_nodeToButton: function (node, buttons) {
		if (!buttons) {
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			if (buttons[i].node === node || $(buttons[i].node).children().eq(0).get(0) === node) {
				return buttons[i];
			}

			if (buttons[i].buttons.length) {
				var ret = this._nodeToButton(node, buttons[i].buttons);

				if (ret) {
					return ret;
				}
			}
		}
	},

	/**
	 * Get container array for a button from a button node (recursive)
	 * @param  {node} node Button node
	 * @param  {array} [buttons] Button array, uses base if not defined
	 * @return {array} Button's host array
	 * @private
	 */
	_nodeToHost: function (node, buttons) {
		if (!buttons) {
			buttons = this.s.buttons;
		}

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			if (buttons[i].node === node) {
				return buttons;
			}

			if (buttons[i].buttons.length) {
				var ret = this._nodeToHost(node, buttons[i].buttons);

				if (ret) {
					return ret;
				}
			}
		}
	},

	/**
	 * Handle a key press - determine if any button's key configured matches
	 * what was typed and trigger the action if so.
	 * @param  {string} character The character pressed
	 * @param  {object} e Key event that triggered this call
	 * @private
	 */
	_keypress: function (character, e) {
		// Check if this button press already activated on another instance of Buttons
		if (e._buttonsHandled) {
			return;
		}

		var run = function (conf, node) {
			if (!conf.key) {
				return;
			}

			if (conf.key === character) {
				e._buttonsHandled = true;
				$(node).click();
			}
			else if ($.isPlainObject(conf.key)) {
				if (conf.key.key !== character) {
					return;
				}

				if (conf.key.shiftKey && !e.shiftKey) {
					return;
				}

				if (conf.key.altKey && !e.altKey) {
					return;
				}

				if (conf.key.ctrlKey && !e.ctrlKey) {
					return;
				}

				if (conf.key.metaKey && !e.metaKey) {
					return;
				}

				// Made it this far - it is good
				e._buttonsHandled = true;
				$(node).click();
			}
		};

		var recurse = function (a) {
			for (var i = 0, ien = a.length; i < ien; i++) {
				run(a[i].conf, a[i].node);

				if (a[i].buttons.length) {
					recurse(a[i].buttons);
				}
			}
		};

		recurse(this.s.buttons);
	},

	/**
	 * Remove a key from the key listener for this instance (to be used when a
	 * button is removed)
	 * @param  {object} conf Button configuration
	 * @private
	 */
	_removeKey: function (conf) {
		if (conf.key) {
			var character = $.isPlainObject(conf.key) ? conf.key.key : conf.key;

			// Remove only one character, as multiple buttons could have the
			// same listening key
			var a = this.s.listenKeys.split('');
			var idx = $.inArray(character, a);
			a.splice(idx, 1);
			this.s.listenKeys = a.join('');
		}
	},

	/**
	 * Resolve a button configuration
	 * @param  {string|function|object} conf Button config to resolve
	 * @return {object} Button configuration
	 * @private
	 */
	_resolveExtends: function (conf) {
		var that = this;
		var dt = this.s.dt;
		var i, ien;
		var toConfObject = function (base) {
			var loop = 0;

			// Loop until we have resolved to a button configuration, or an
			// array of button configurations (which will be iterated
			// separately)
			while (!$.isPlainObject(base) && !Array.isArray(base)) {
				if (base === undefined) {
					return;
				}

				if (typeof base === 'function') {
					base = base.call(that, dt, conf);

					if (!base) {
						return false;
					}
				}
				else if (typeof base === 'string') {
					if (!_dtButtons[base]) {
						return { html: base };
					}

					base = _dtButtons[base];
				}

				loop++;
				if (loop > 30) {
					// Protect against misconfiguration killing the browser
					throw 'Buttons: Too many iterations';
				}
			}

			return Array.isArray(base) ? base : $.extend({}, base);
		};

		conf = toConfObject(conf);

		while (conf && conf.extend) {
			// Use `toConfObject` in case the button definition being extended
			// is itself a string or a function
			if (!_dtButtons[conf.extend]) {
				throw 'Cannot extend unknown button type: ' + conf.extend;
			}

			var objArray = toConfObject(_dtButtons[conf.extend]);
			if (Array.isArray(objArray)) {
				return objArray;
			}
			else if (!objArray) {
				// This is a little brutal as it might be possible to have a
				// valid button without the extend, but if there is no extend
				// then the host button would be acting in an undefined state
				return false;
			}

			// Stash the current class name
			var originalClassName = objArray.className;

			if (conf.config !== undefined && objArray.config !== undefined) {
				conf.config = $.extend({}, objArray.config, conf.config);
			}

			conf = $.extend({}, objArray, conf);

			// The extend will have overwritten the original class name if the
			// `conf` object also assigned a class, but we want to concatenate
			// them so they are list that is combined from all extended buttons
			if (originalClassName && conf.className !== originalClassName) {
				conf.className = originalClassName + ' ' + conf.className;
			}

			// Although we want the `conf` object to overwrite almost all of
			// the properties of the object being extended, the `extend`
			// property should come from the object being extended
			conf.extend = objArray.extend;
		}

		// Buttons to be added to a collection  -gives the ability to define
		// if buttons should be added to the start or end of a collection
		var postfixButtons = conf.postfixButtons;
		if (postfixButtons) {
			if (!conf.buttons) {
				conf.buttons = [];
			}

			for (i = 0, ien = postfixButtons.length; i < ien; i++) {
				conf.buttons.push(postfixButtons[i]);
			}
		}

		var prefixButtons = conf.prefixButtons;
		if (prefixButtons) {
			if (!conf.buttons) {
				conf.buttons = [];
			}

			for (i = 0, ien = prefixButtons.length; i < ien; i++) {
				conf.buttons.splice(i, 0, prefixButtons[i]);
			}
		}

		return conf;
	},

	/**
	 * Display (and replace if there is an existing one) a popover attached to a button
	 * @param {string|node} content Content to show
	 * @param {DataTable.Api} hostButton DT API instance of the button
	 * @param {object} inOpts Options (see object below for all options)
	 */
	_popover: function (content, hostButton, inOpts) {
		var dt = hostButton;
		var c = this.c;
		var closed = false;
		var options = $.extend(
			{
				align: 'button-left', // button-right, dt-container, split-left, split-right
				autoClose: false,
				background: true,
				backgroundClassName: 'dt-button-background',
				closeButton: true,
				containerClassName: c.dom.collection.container.className,
				contentClassName: c.dom.collection.container.content.className,
				collectionLayout: '',
				collectionTitle: '',
				dropup: false,
				fade: 400,
				popoverTitle: '',
				rightAlignClassName: 'dt-button-right',
				tag: c.dom.collection.container.tag
			},
			inOpts
		);

		var containerSelector =
			options.tag + '.' + options.containerClassName.replace(/ /g, '.');
		var hostButtonNode = hostButton.node();
		var hostNode = options.collectionLayout.includes('fixed') ? $('body') : hostButton.node();

		var close = function () {
			closed = true;

			_fadeOut($(containerSelector), options.fade, function () {
				$(this).detach();
			});

			$(
				dt
					.buttons('[aria-haspopup="dialog"][aria-expanded="true"]')
					.nodes()
			).attr('aria-expanded', 'false');

			$('div.dt-button-background').off('click.dtb-collection');
			Buttons.background(
				false,
				options.backgroundClassName,
				options.fade,
				hostNode
			);

			$(window).off('resize.resize.dtb-collection');
			$('body').off('.dtb-collection');
			dt.off('buttons-action.b-internal');
			dt.off('destroy');

			$('body').trigger('buttons-popover-hide.dt');
		};

		if (content === false) {
			close();
			return;
		}

		var existingExpanded = $(
			dt.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
		);
		if (existingExpanded.length) {
			// Reuse the current position if the button that was triggered is inside an existing collection
			if (hostNode.closest(containerSelector).length) {
				hostNode = existingExpanded.eq(0);
			}

			close();
		}

		// Sort buttons if defined
		if (options.sort) {
			var elements = $('button', content)
				.map(function (idx, el) {
					return {
						text: $(el).text(),
						el: el
					};
				})
				.toArray();

			elements.sort(function (a, b) {
				return a.text.localeCompare(b.text);
			});

			$(content).append(elements.map(function (v) {
				return v.el;
			}));
		}

		// Try to be smart about the layout
		var cnt = $('.dt-button', content).length;
		var mod = '';

		if (cnt === 3) {
			mod = 'dtb-b3';
		}
		else if (cnt === 2) {
			mod = 'dtb-b2';
		}
		else if (cnt === 1) {
			mod = 'dtb-b1';
		}

		var display = $('<' + options.tag + '/>')
			.addClass(options.containerClassName)
			.addClass(options.collectionLayout)
			.addClass(options.splitAlignClass)
			.addClass(mod)
			.css('display', 'none')
			.attr({
				'aria-modal': true,
				role: 'dialog'
			});

		content = $(content)
			.addClass(options.contentClassName)
			.attr('role', 'menu')
			.appendTo(display);

		hostButtonNode.attr('aria-expanded', 'true');

		if (hostNode.parents('body')[0] !== document.body) {
			hostNode = $(document.body).children('div, section, p').last();
		}

		if (options.popoverTitle) {
			display.prepend(
				'<div class="dt-button-collection-title">' +
					options.popoverTitle +
					'</div>'
			);
		}
		else if (options.collectionTitle) {
			display.prepend(
				'<div class="dt-button-collection-title">' +
					options.collectionTitle +
					'</div>'
			);
		}

		if (options.closeButton) {
			display
				.prepend('<div class="dtb-popover-close">&times;</div>')
				.addClass('dtb-collection-closeable');
		}

		_fadeIn(display.insertAfter(hostNode), options.fade);

		var tableContainer = $(hostButton.table().container());
		var position = display.css('position');

		if (options.span === 'container' || options.align === 'dt-container') {
			hostNode = hostNode.parent();
			display.css('width', tableContainer.width());
		}

		// Align the popover relative to the DataTables container
		// Useful for wide popovers such as SearchPanes
		if (position === 'absolute') {
			// Align relative to the host button
			var offsetParent = $(hostNode[0].offsetParent);
			var buttonPosition = hostNode.position();
			var buttonOffset = hostNode.offset();
			var tableSizes = offsetParent.offset();
			var containerPosition = offsetParent.position();
			var computed = window.getComputedStyle(offsetParent[0]);

			tableSizes.height = offsetParent.outerHeight();
			tableSizes.width =
				offsetParent.width() + parseFloat(computed.paddingLeft);
			tableSizes.right = tableSizes.left + tableSizes.width;
			tableSizes.bottom = tableSizes.top + tableSizes.height;

			// Set the initial position so we can read height / width
			var top = buttonPosition.top + hostNode.outerHeight();
			var left = buttonPosition.left;

			display.css({
				top: top,
				left: left
			});

			// Get the popover position
			computed = window.getComputedStyle(display[0]);
			var popoverSizes = display.offset();

			popoverSizes.height = display.outerHeight();
			popoverSizes.width = display.outerWidth();
			popoverSizes.right = popoverSizes.left + popoverSizes.width;
			popoverSizes.bottom = popoverSizes.top + popoverSizes.height;
			popoverSizes.marginTop = parseFloat(computed.marginTop);
			popoverSizes.marginBottom = parseFloat(computed.marginBottom);

			// First position per the class requirements - pop up and right align
			if (options.dropup) {
				top =
					buttonPosition.top -
					popoverSizes.height -
					popoverSizes.marginTop -
					popoverSizes.marginBottom;
			}

			if (
				options.align === 'button-right' ||
				display.hasClass(options.rightAlignClassName)
			) {
				left =
					buttonPosition.left -
					popoverSizes.width +
					hostNode.outerWidth();
			}

			// Container alignment - make sure it doesn't overflow the table container
			if (
				options.align === 'dt-container' ||
				options.align === 'container'
			) {
				if (left < buttonPosition.left) {
					left = -buttonPosition.left;
				}
			}

			// Window adjustment
			if (
				containerPosition.left + left + popoverSizes.width >
				$(window).width()
			) {
				// Overflowing the document to the right
				left =
					$(window).width() -
					popoverSizes.width -
					containerPosition.left;
			}

			if (buttonOffset.left + left < 0) {
				// Off to the left of the document
				left = -buttonOffset.left;
			}

			if (
				containerPosition.top + top + popoverSizes.height >
				$(window).height() + $(window).scrollTop()
			) {
				// Pop up if otherwise we'd need the user to scroll down
				top =
					buttonPosition.top -
					popoverSizes.height -
					popoverSizes.marginTop -
					popoverSizes.marginBottom;
			}

			if (offsetParent.offset().top + top < $(window).scrollTop()) {
				// Correction for when the top is beyond the top of the page
				top = buttonPosition.top + hostNode.outerHeight();
			}

			// Calculations all done - now set it
			display.css({
				top: top,
				left: left
			});
		}
		else {
			// Fix position - centre on screen
			var place = function () {
				var half = $(window).height() / 2;

				var top = display.height() / 2;
				if (top > half) {
					top = half;
				}

				display.css('marginTop', top * -1);
			};

			place();

			$(window).on('resize.dtb-collection', function () {
				place();
			});
		}

		if (options.background) {
			Buttons.background(
				true,
				options.backgroundClassName,
				options.fade,
				options.backgroundHost || hostNode
			);
		}

		// This is bonkers, but if we don't have a click listener on the
		// background element, iOS Safari will ignore the body click
		// listener below. An empty function here is all that is
		// required to make it work...
		$('div.dt-button-background').on(
			'click.dtb-collection',
			function () {}
		);

		if (options.autoClose) {
			setTimeout(function () {
				dt.on('buttons-action.b-internal', function (e, btn, dt, node) {
					if (node[0] === hostNode[0]) {
						return;
					}
					close();
				});
			}, 0);
		}

		$(display).trigger('buttons-popover.dt');

		dt.on('destroy', close);

		setTimeout(function () {
			closed = false;
			$('body')
				.on('click.dtb-collection', function (e) {
					if (closed) {
						return;
					}

					// andSelf is deprecated in jQ1.8, but we want 1.7 compat
					var back = $.fn.addBack ? 'addBack' : 'andSelf';
					var parent = $(e.target).parent()[0];

					if (
						(!$(e.target).parents()[back]().filter(content)
							.length &&
							!$(parent).hasClass('dt-buttons')) ||
						$(e.target).hasClass('dt-button-background')
					) {
						close();
					}
				})
				.on('keyup.dtb-collection', function (e) {
					if (e.keyCode === 27) {
						close();
					}
				})
				.on('keydown.dtb-collection', function (e) {
					// Focus trap for tab key
					var elements = $('a, button', content);
					var active = document.activeElement;

					if (e.keyCode !== 9) {
						// tab
						return;
					}

					if (elements.index(active) === -1) {
						// If current focus is not inside the popover
						elements.first().focus();
						e.preventDefault();
					}
					else if (e.shiftKey) {
						// Reverse tabbing order when shift key is pressed
						if (active === elements[0]) {
							elements.last().focus();
							e.preventDefault();
						}
					}
					else {
						if (active === elements.last()[0]) {
							elements.first().focus();
							e.preventDefault();
						}
					}
				});
		}, 0);
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 */

/**
 * Show / hide a background layer behind a collection
 * @param  {boolean} Flag to indicate if the background should be shown or
 *   hidden
 * @param  {string} Class to assign to the background
 * @static
 */
Buttons.background = function (show, className, fade, insertPoint) {
	if (fade === undefined) {
		fade = 400;
	}
	if (!insertPoint) {
		insertPoint = document.body;
	}

	if (show) {
		_fadeIn(
			$('<div/>')
				.addClass(className)
				.css('display', 'none')
				.insertAfter(insertPoint),
			fade
		);
	}
	else {
		_fadeOut($('div.' + className), fade, function () {
			$(this).removeClass(className).remove();
		});
	}
};

/**
 * Instance selector - select Buttons instances based on an instance selector
 * value from the buttons assigned to a DataTable. This is only useful if
 * multiple instances are attached to a DataTable.
 * @param  {string|int|array} Instance selector - see `instance-selector`
 *   documentation on the DataTables site
 * @param  {array} Button instance array that was attached to the DataTables
 *   settings object
 * @return {array} Buttons instances
 * @static
 */
Buttons.instanceSelector = function (group, buttons) {
	if (group === undefined || group === null) {
		return $.map(buttons, function (v) {
			return v.inst;
		});
	}

	var ret = [];
	var names = $.map(buttons, function (v) {
		return v.name;
	});

	// Flatten the group selector into an array of single options
	var process = function (input) {
		if (Array.isArray(input)) {
			for (var i = 0, ien = input.length; i < ien; i++) {
				process(input[i]);
			}
			return;
		}

		if (typeof input === 'string') {
			if (input.indexOf(',') !== -1) {
				// String selector, list of names
				process(input.split(','));
			}
			else {
				// String selector individual name
				var idx = $.inArray(input.trim(), names);

				if (idx !== -1) {
					ret.push(buttons[idx].inst);
				}
			}
		}
		else if (typeof input === 'number') {
			// Index selector
			ret.push(buttons[input].inst);
		}
		else if (typeof input === 'object' && input.nodeName) {
			// Element selector
			for (var j = 0; j < buttons.length; j++) {
				if (buttons[j].inst.dom.container[0] === input) {
					ret.push(buttons[j].inst);
				}
			}
		}
		else if (typeof input === 'object') {
			// Actual instance selector
			ret.push(input);
		}
	};

	process(group);

	return ret;
};

/**
 * Button selector - select one or more buttons from a selector input so some
 * operation can be performed on them.
 * @param  {array} Button instances array that the selector should operate on
 * @param  {string|int|node|jQuery|array} Button selector - see
 *   `button-selector` documentation on the DataTables site
 * @return {array} Array of objects containing `inst` and `idx` properties of
 *   the selected buttons so you know which instance each button belongs to.
 * @static
 */
Buttons.buttonSelector = function (insts, selector) {
	var ret = [];
	var nodeBuilder = function (a, buttons, baseIdx) {
		var button;
		var idx;

		for (var i = 0, ien = buttons.length; i < ien; i++) {
			button = buttons[i];

			if (button) {
				idx = baseIdx !== undefined ? baseIdx + i : i + '';

				a.push({
					node: button.node,
					name: button.conf.name,
					idx: idx
				});

				if (button.buttons) {
					nodeBuilder(a, button.buttons, idx + '-');
				}
			}
		}
	};

	var run = function (selector, inst) {
		var i, ien;
		var buttons = [];
		nodeBuilder(buttons, inst.s.buttons);

		var nodes = $.map(buttons, function (v) {
			return v.node;
		});

		if (Array.isArray(selector) || selector instanceof $) {
			for (i = 0, ien = selector.length; i < ien; i++) {
				run(selector[i], inst);
			}
			return;
		}

		if (selector === null || selector === undefined || selector === '*') {
			// Select all
			for (i = 0, ien = buttons.length; i < ien; i++) {
				ret.push({
					inst: inst,
					node: buttons[i].node
				});
			}
		}
		else if (typeof selector === 'number') {
			// Main button index selector
			if (inst.s.buttons[selector]) {
				ret.push({
					inst: inst,
					node: inst.s.buttons[selector].node
				});
			}
		}
		else if (typeof selector === 'string') {
			if (selector.indexOf(',') !== -1) {
				// Split
				var a = selector.split(',');

				for (i = 0, ien = a.length; i < ien; i++) {
					run(a[i].trim(), inst);
				}
			}
			else if (selector.match(/^\d+(\-\d+)*$/)) {
				// Sub-button index selector
				var indexes = $.map(buttons, function (v) {
					return v.idx;
				});

				ret.push({
					inst: inst,
					node: buttons[$.inArray(selector, indexes)].node
				});
			}
			else if (selector.indexOf(':name') !== -1) {
				// Button name selector
				var name = selector.replace(':name', '');

				for (i = 0, ien = buttons.length; i < ien; i++) {
					if (buttons[i].name === name) {
						ret.push({
							inst: inst,
							node: buttons[i].node
						});
					}
				}
			}
			else {
				// jQuery selector on the nodes
				$(nodes)
					.filter(selector)
					.each(function () {
						ret.push({
							inst: inst,
							node: this
						});
					});
			}
		}
		else if (typeof selector === 'object' && selector.nodeName) {
			// Node selector
			var idx = $.inArray(selector, nodes);

			if (idx !== -1) {
				ret.push({
					inst: inst,
					node: nodes[idx]
				});
			}
		}
	};

	for (var i = 0, ien = insts.length; i < ien; i++) {
		var inst = insts[i];

		run(selector, inst);
	}

	return ret;
};

/**
 * Default function used for formatting output data.
 * @param {*} str Data to strip
 */
Buttons.stripData = function (str, config) {
	// If the input is an HTML element, we can use the HTML from it (HTML might be stripped below).
	if (str !== null && typeof str === 'object' && str.nodeName && str.nodeType) {
		str = str.innerHTML;
	}

	if (typeof str !== 'string') {
		return str;
	}

	// Always remove script tags
	str = Buttons.stripHtmlScript(str);

	// Always remove comments
	str = Buttons.stripHtmlComments(str);

	if (!config || config.stripHtml) {
		str = DataTable.util.stripHtml(str);
	}

	if (!config || config.trim) {
		str = str.trim();
	}

	if (!config || config.stripNewlines) {
		str = str.replace(/\n/g, ' ');
	}

	if (!config || config.decodeEntities) {
		if (_entityDecoder) {
			str = _entityDecoder(str);
		}
		else {
			_exportTextarea.innerHTML = str;
			str = _exportTextarea.value;
		}
	}

	// Prevent Excel from running a formula
	if (!config || config.escapeExcelFormula) {
		if (str.match(/^[=+\-@\t\r]/)) {
			console.log('matching and updateing');
			str = "'" + str;
		}
	}

	return str;
};

/**
 * Provide a custom entity decoding function - e.g. a regex one, which can be
 * much faster than the built in DOM option, but also larger code size.
 * @param {function} fn
 */
Buttons.entityDecoder = function (fn) {
	_entityDecoder = fn;
};

/**
 * Common function for stripping HTML comments
 *
 * @param {*} input 
 * @returns 
 */
Buttons.stripHtmlComments = function (input) {
	var previous;  
	
	do {  
		previous = input;
		input = input.replace(/(<!--.*?--!?>)|(<!--[\S\s]+?--!?>)|(<!--[\S\s]*?$)/g, '');
	} while (input !== previous);  

	return input;  
};

/**
 * Common function for stripping HTML script tags
 *
 * @param {*} input 
 * @returns 
 */
Buttons.stripHtmlScript = function (input) {
	var previous;  
	
	do {  
		previous = input;
		input = input.replace(/<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi, '');
	} while (input !== previous);  

	return input;  
};

/**
 * Buttons defaults. For full documentation, please refer to the docs/option
 * directory or the DataTables site.
 * @type {Object}
 * @static
 */
Buttons.defaults = {
	buttons: ['copy', 'excel', 'csv', 'pdf', 'print'],
	name: 'main',
	tabIndex: 0,
	dom: {
		container: {
			tag: 'div',
			className: 'dt-buttons'
		},
		collection: {
			container: {
				// The element used for the dropdown
				className: 'dt-button-collection',
				content: {
					className: '',
					tag: 'div'
				},
				tag: 'div'
			}
			// optionally
			// , button: IButton - buttons inside the collection container
			// , split: ISplit - splits inside the collection container
		},
		button: {
			tag: 'button',
			className: 'dt-button',
			active: 'dt-button-active', // class name
			disabled: 'disabled', // class name
			spacer: {
				className: 'dt-button-spacer',
				tag: 'span'
			},
			liner: {
				tag: 'span',
				className: ''
			},
			dropClass: '',
			dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>'
		},
		split: {
			action: {
				// action button
				className: 'dt-button-split-drop-button dt-button',
				tag: 'button'
			},
			dropdown: {
				// button to trigger the dropdown
				align: 'split-right',
				className: 'dt-button-split-drop',
				splitAlignClass: 'dt-button-split-left',
				tag: 'button'
			},
			wrapper: {
				// wrap around both
				className: 'dt-button-split',
				tag: 'div'
			}
		}
	}
};

/**
 * Version information
 * @type {string}
 * @static
 */
Buttons.version = '3.2.2';

$.extend(_dtButtons, {
	collection: {
		text: function (dt) {
			return dt.i18n('buttons.collection', 'Collection');
		},
		className: 'buttons-collection',
		closeButton: false,
		dropIcon: true,
		init: function (dt, button) {
			button.attr('aria-expanded', false);
		},
		action: function (e, dt, button, config) {
			if (config._collection.parents('body').length) {
				this.popover(false, config);
			}
			else {
				this.popover(config._collection, config);
			}

			// When activated using a key - auto focus on the
			// first item in the popover
			if (e.type === 'keypress') {
				$('a, button', config._collection).eq(0).focus();
			}
		},
		attr: {
			'aria-haspopup': 'dialog'
		}
		// Also the popover options, defined in Buttons.popover
	},
	split: {
		text: function (dt) {
			return dt.i18n('buttons.split', 'Split');
		},
		className: 'buttons-split',
		closeButton: false,
		init: function (dt, button) {
			return button.attr('aria-expanded', false);
		},
		action: function (e, dt, button, config) {
			this.popover(config._collection, config);
		},
		attr: {
			'aria-haspopup': 'dialog'
		}
		// Also the popover options, defined in Buttons.popover
	},
	copy: function () {
		if (_dtButtons.copyHtml5) {
			return 'copyHtml5';
		}
	},
	csv: function (dt, conf) {
		if (_dtButtons.csvHtml5 && _dtButtons.csvHtml5.available(dt, conf)) {
			return 'csvHtml5';
		}
	},
	excel: function (dt, conf) {
		if (
			_dtButtons.excelHtml5 &&
			_dtButtons.excelHtml5.available(dt, conf)
		) {
			return 'excelHtml5';
		}
	},
	pdf: function (dt, conf) {
		if (_dtButtons.pdfHtml5 && _dtButtons.pdfHtml5.available(dt, conf)) {
			return 'pdfHtml5';
		}
	},
	pageLength: function (dt) {
		var lengthMenu = dt.settings()[0].aLengthMenu;
		var vals = [];
		var lang = [];
		var text = function (dt) {
			return dt.i18n(
				'buttons.pageLength',
				{
					'-1': 'Show all rows',
					_: 'Show %d rows'
				},
				dt.page.len()
			);
		};

		// Support for DataTables 1.x 2D array
		if (Array.isArray(lengthMenu[0])) {
			vals = lengthMenu[0];
			lang = lengthMenu[1];
		}
		else {
			for (var i = 0; i < lengthMenu.length; i++) {
				var option = lengthMenu[i];

				// Support for DataTables 2 object in the array
				if ($.isPlainObject(option)) {
					vals.push(option.value);
					lang.push(option.label);
				}
				else {
					vals.push(option);
					lang.push(option);
				}
			}
		}

		return {
			extend: 'collection',
			text: text,
			className: 'buttons-page-length',
			autoClose: true,
			buttons: $.map(vals, function (val, i) {
				return {
					text: lang[i],
					className: 'button-page-length',
					action: function (e, dt) {
						dt.page.len(val).draw();
					},
					init: function (dt, node, conf) {
						var that = this;
						var fn = function () {
							that.active(dt.page.len() === val);
						};

						dt.on('length.dt' + conf.namespace, fn);
						fn();
					},
					destroy: function (dt, node, conf) {
						dt.off('length.dt' + conf.namespace);
					}
				};
			}),
			init: function (dt, node, conf) {
				var that = this;
				dt.on('length.dt' + conf.namespace, function () {
					that.text(conf.text);
				});
			},
			destroy: function (dt, node, conf) {
				dt.off('length.dt' + conf.namespace);
			}
		};
	},
	spacer: {
		style: 'empty',
		spacer: true,
		text: function (dt) {
			return dt.i18n('buttons.spacer', '');
		}
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API
 *
 * For complete documentation, please refer to the docs/api directory or the
 * DataTables site
 */

// Buttons group and individual button selector
DataTable.Api.register('buttons()', function (group, selector) {
	// Argument shifting
	if (selector === undefined) {
		selector = group;
		group = undefined;
	}

	this.selector.buttonGroup = group;

	var res = this.iterator(
		true,
		'table',
		function (ctx) {
			if (ctx._buttons) {
				return Buttons.buttonSelector(
					Buttons.instanceSelector(group, ctx._buttons),
					selector
				);
			}
		},
		true
	);

	res._groupSelector = group;
	return res;
});

// Individual button selector
DataTable.Api.register('button()', function (group, selector) {
	// just run buttons() and truncate
	var buttons = this.buttons(group, selector);

	if (buttons.length > 1) {
		buttons.splice(1, buttons.length);
	}

	return buttons;
});

// Active buttons
DataTable.Api.registerPlural(
	'buttons().active()',
	'button().active()',
	function (flag) {
		if (flag === undefined) {
			return this.map(function (set) {
				return set.inst.active(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.active(set.node, flag);
		});
	}
);

// Get / set button action
DataTable.Api.registerPlural(
	'buttons().action()',
	'button().action()',
	function (action) {
		if (action === undefined) {
			return this.map(function (set) {
				return set.inst.action(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.action(set.node, action);
		});
	}
);

// Collection control
DataTable.Api.registerPlural(
	'buttons().collectionRebuild()',
	'button().collectionRebuild()',
	function (buttons) {
		return this.each(function (set) {
			for (var i = 0; i < buttons.length; i++) {
				if (typeof buttons[i] === 'object') {
					buttons[i].parentConf = set;
				}
			}
			set.inst.collectionRebuild(set.node, buttons);
		});
	}
);

// Enable / disable buttons
DataTable.Api.register(
	['buttons().enable()', 'button().enable()'],
	function (flag) {
		return this.each(function (set) {
			set.inst.enable(set.node, flag);
		});
	}
);

// Disable buttons
DataTable.Api.register(
	['buttons().disable()', 'button().disable()'],
	function () {
		return this.each(function (set) {
			set.inst.disable(set.node);
		});
	}
);

// Button index
DataTable.Api.register('button().index()', function () {
	var idx = null;

	this.each(function (set) {
		var res = set.inst.index(set.node);

		if (res !== null) {
			idx = res;
		}
	});

	return idx;
});

// Get button nodes
DataTable.Api.registerPlural(
	'buttons().nodes()',
	'button().node()',
	function () {
		var jq = $();

		// jQuery will automatically reduce duplicates to a single entry
		$(
			this.each(function (set) {
				jq = jq.add(set.inst.node(set.node));
			})
		);

		return jq;
	}
);

// Get / set button processing state
DataTable.Api.registerPlural(
	'buttons().processing()',
	'button().processing()',
	function (flag) {
		if (flag === undefined) {
			return this.map(function (set) {
				return set.inst.processing(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.processing(set.node, flag);
		});
	}
);

// Get / set button text (i.e. the button labels)
DataTable.Api.registerPlural(
	'buttons().text()',
	'button().text()',
	function (label) {
		if (label === undefined) {
			return this.map(function (set) {
				return set.inst.text(set.node);
			});
		}

		return this.each(function (set) {
			set.inst.text(set.node, label);
		});
	}
);

// Trigger a button's action
DataTable.Api.registerPlural(
	'buttons().trigger()',
	'button().trigger()',
	function () {
		return this.each(function (set) {
			set.inst.node(set.node).trigger('click');
		});
	}
);

// Button resolver to the popover
DataTable.Api.register('button().popover()', function (content, options) {
	return this.map(function (set) {
		return set.inst._popover(content, this.button(this[0].node), options);
	});
});

// Get the container elements
DataTable.Api.register('buttons().containers()', function () {
	var jq = $();
	var groupSelector = this._groupSelector;

	// We need to use the group selector directly, since if there are no buttons
	// the result set will be empty
	this.iterator(true, 'table', function (ctx) {
		if (ctx._buttons) {
			var insts = Buttons.instanceSelector(groupSelector, ctx._buttons);

			for (var i = 0, ien = insts.length; i < ien; i++) {
				jq = jq.add(insts[i].container());
			}
		}
	});

	return jq;
});

DataTable.Api.register('buttons().container()', function () {
	// API level of nesting is `buttons()` so we can zip into the containers method
	return this.containers().eq(0);
});

// Add a new button
DataTable.Api.register('button().add()', function (idx, conf, draw) {
	var ctx = this.context;

	// Don't use `this` as it could be empty - select the instances directly
	if (ctx.length) {
		var inst = Buttons.instanceSelector(
			this._groupSelector,
			ctx[0]._buttons
		);

		if (inst.length) {
			inst[0].add(conf, idx, draw);
		}
	}

	return this.button(this._groupSelector, idx);
});

// Destroy the button sets selected
DataTable.Api.register('buttons().destroy()', function () {
	this.pluck('inst')
		.unique()
		.each(function (inst) {
			inst.destroy();
		});

	return this;
});

// Remove a button
DataTable.Api.registerPlural(
	'buttons().remove()',
	'buttons().remove()',
	function () {
		this.each(function (set) {
			set.inst.remove(set.node);
		});

		return this;
	}
);

// Information box that can be used by buttons
var _infoTimer;
DataTable.Api.register('buttons.info()', function (title, message, time) {
	var that = this;

	if (title === false) {
		this.off('destroy.btn-info');
		_fadeOut($('#datatables_buttons_info'), 400, function () {
			$(this).remove();
		});
		clearTimeout(_infoTimer);
		_infoTimer = null;

		return this;
	}

	if (_infoTimer) {
		clearTimeout(_infoTimer);
	}

	if ($('#datatables_buttons_info').length) {
		$('#datatables_buttons_info').remove();
	}

	title = title ? '<h2>' + title + '</h2>' : '';

	_fadeIn(
		$('<div id="datatables_buttons_info" class="dt-button-info"/>')
			.html(title)
			.append(
				$('<div/>')[typeof message === 'string' ? 'html' : 'append'](
					message
				)
			)
			.css('display', 'none')
			.appendTo('body')
	);

	if (time !== undefined && time !== 0) {
		_infoTimer = setTimeout(function () {
			that.buttons.info(false);
		}, time);
	}

	this.on('destroy.btn-info', function () {
		that.buttons.info(false);
	});

	return this;
});

// Get data from the table for export - this is common to a number of plug-in
// buttons so it is included in the Buttons core library
DataTable.Api.register('buttons.exportData()', function (options) {
	if (this.context.length) {
		return _exportData(new DataTable.Api(this.context[0]), options);
	}
});

// Get information about the export that is common to many of the export data
// types (DRY)
DataTable.Api.register('buttons.exportInfo()', function (conf) {
	if (!conf) {
		conf = {};
	}

	return {
		filename: _filename(conf, this),
		title: _title(conf, this),
		messageTop: _message(this, conf, conf.message || conf.messageTop, 'top'),
		messageBottom: _message(this, conf, conf.messageBottom, 'bottom')
	};
});

/**
 * Get the file name for an exported file.
 *
 * @param {object} config Button configuration
 * @param {object} dt DataTable instance
 */
var _filename = function (config, dt) {
	// Backwards compatibility
	var filename =
		config.filename === '*' &&
		config.title !== '*' &&
		config.title !== undefined &&
		config.title !== null &&
		config.title !== ''
			? config.title
			: config.filename;

	if (typeof filename === 'function') {
		filename = filename(config, dt);
	}

	if (filename === undefined || filename === null) {
		return null;
	}

	if (filename.indexOf('*') !== -1) {
		filename = filename.replace(/\*/g, $('head > title').text()).trim();
	}

	// Strip characters which the OS will object to
	filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, '');

	var extension = _stringOrFunction(config.extension, config, dt);
	if (!extension) {
		extension = '';
	}

	return filename + extension;
};

/**
 * Simply utility method to allow parameters to be given as a function
 *
 * @param {undefined|string|function} option Option
 * @return {null|string} Resolved value
 */
var _stringOrFunction = function (option, config, dt) {
	if (option === null || option === undefined) {
		return null;
	}
	else if (typeof option === 'function') {
		return option(config, dt);
	}
	return option;
};

/**
 * Get the title for an exported file.
 *
 * @param {object} config	Button configuration
 */
var _title = function (config, dt) {
	var title = _stringOrFunction(config.title, config, dt);

	return title === null
		? null
		: title.indexOf('*') !== -1
		? title.replace(/\*/g, $('head > title').text() || 'Exported data')
		: title;
};

var _message = function (dt, config, option, position) {
	var message = _stringOrFunction(option, config, dt);
	if (message === null) {
		return null;
	}

	var caption = $('caption', dt.table().container()).eq(0);
	if (message === '*') {
		var side = caption.css('caption-side');
		if (side !== position) {
			return null;
		}

		return caption.length ? caption.text() : '';
	}

	return message;
};

var _exportTextarea = $('<textarea/>')[0];
var _exportData = function (dt, inOpts) {
	var config = $.extend(
		true,
		{},
		{
			rows: null,
			columns: '',
			modifier: {
				search: 'applied',
				order: 'applied'
			},
			orthogonal: 'display',
			stripHtml: true,
			stripNewlines: true,
			decodeEntities: true,
			escapeExcelFormula: false,
			trim: true,
			format: {
				header: function (d) {
					return Buttons.stripData(d, config);
				},
				footer: function (d) {
					return Buttons.stripData(d, config);
				},
				body: function (d) {
					return Buttons.stripData(d, config);
				}
			},
			customizeData: null,
			customizeZip: null
		},
		inOpts
	);

	var header = dt
		.columns(config.columns)
		.indexes()
		.map(function (idx) {
			var col = dt.column(idx);
			return config.format.header(col.title(), idx, col.header());
		})
		.toArray();

	var footer = dt.table().footer()
		? dt
				.columns(config.columns)
				.indexes()
				.map(function (idx) {
					var el = dt.column(idx).footer();
					var val = '';

					if (el) {
						var inner = $('.dt-column-title', el);

						val = inner.length
							? inner.html()
							: $(el).html();
					}

					return config.format.footer(val, idx, el);
				})
				.toArray()
		: null;

	// If Select is available on this table, and any rows are selected, limit the export
	// to the selected rows. If no rows are selected, all rows will be exported. Specify
	// a `selected` modifier to control directly.
	var modifier = $.extend({}, config.modifier);
	if (
		dt.select &&
		typeof dt.select.info === 'function' &&
		modifier.selected === undefined
	) {
		if (
			dt.rows(config.rows, $.extend({ selected: true }, modifier)).any()
		) {
			$.extend(modifier, { selected: true });
		}
	}

	var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
	var selectedCells = dt.cells(rowIndexes, config.columns, {
		order: modifier.order
	});
	var cells = selectedCells.render(config.orthogonal).toArray();
	var cellNodes = selectedCells.nodes().toArray();
	var cellIndexes = selectedCells.indexes().toArray();

	var columns = dt.columns(config.columns).count();
	var rows = columns > 0 ? cells.length / columns : 0;
	var body = [];
	var cellCounter = 0;

	for (var i = 0, ien = rows; i < ien; i++) {
		var row = [columns];

		for (var j = 0; j < columns; j++) {
			row[j] = config.format.body(
				cells[cellCounter],
				cellIndexes[cellCounter].row,
				cellIndexes[cellCounter].column,
				cellNodes[cellCounter]
			);
			cellCounter++;
		}

		body[i] = row;
	}

	var data = {
		header: header,
		headerStructure: _headerFormatter(
			config.format.header,
			dt.table().header.structure(config.columns)
		),
		footer: footer,
		footerStructure: _headerFormatter(
			config.format.footer,
			dt.table().footer.structure(config.columns)
		),
		body: body
	};

	if (config.customizeData) {
		config.customizeData(data);
	}

	return data;
};

function _headerFormatter(formatter, struct) {
	for (var i=0 ; i<struct.length ; i++) {
		for (var j=0 ; j<struct[i].length ; j++) {
			var item = struct[i][j];

			if (item) {
				item.title = formatter(
					item.title,
					j,
					item.cell
				);
			}
		}
	}

	return struct;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interface
 */

// Attach to DataTables objects for global access
$.fn.dataTable.Buttons = Buttons;
$.fn.DataTable.Buttons = Buttons;

// DataTables creation - check if the buttons have been defined for this table,
// they will have been if the `B` option was used in `dom`, otherwise we should
// create the buttons instance here so they can be inserted into the document
// using the API. Listen for `init` for compatibility with pre 1.10.10, but to
// be removed in future.
$(document).on('init.dt plugin-init.dt', function (e, settings) {
	if (e.namespace !== 'dt') {
		return;
	}

	var opts = settings.oInit.buttons || DataTable.defaults.buttons;

	if (opts && !settings._buttons) {
		new Buttons(settings, opts).container();
	}
});

function _init(settings, options) {
	var api = new DataTable.Api(settings);
	var opts = options
		? options
		: api.init().buttons || DataTable.defaults.buttons;

	return new Buttons(api, opts).container();
}

// DataTables 1 `dom` feature option
DataTable.ext.feature.push({
	fnInit: _init,
	cFeature: 'B'
});

// DataTables 2 layout feature
if (DataTable.feature) {
	DataTable.feature.register('buttons', _init);
}


return DataTable;
}));


/*! Bootstrap integration for DataTables' Buttons
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



$.extend(true, DataTable.Buttons.defaults, {
	dom: {
		container: {
			className: 'dt-buttons btn-group flex-wrap'
		},
		button: {
			className: 'btn btn-secondary',
			active: 'active',
			dropHtml: '',
			dropClass: 'dropdown-toggle'
		},
		collection: {
			container: {
				tag: 'div',
				className: 'dropdown-menu dt-button-collection'
			},
			closeButton: false,
			button: {
				tag: 'a',
				className: 'dt-button dropdown-item',
				active: 'dt-button-active',
				disabled: 'disabled',
				spacer: {
					className: 'dropdown-divider',
					tag: 'hr'
				}
			}
		},
		split: {
			action: {
				tag: 'a',
				className: 'btn btn-secondary dt-button-split-drop-button',
				closeButton: false
			},
			dropdown: {
				tag: 'button',
				className:
					'btn btn-secondary dt-button-split-drop dropdown-toggle-split',
				closeButton: false,
				align: 'split-left',
				splitAlignClass: 'dt-button-split-left'
			},
			wrapper: {
				tag: 'div',
				className: 'dt-button-split btn-group',
				closeButton: false
			}
		}
	},
	buttonCreated: function (config, button) {
		return config.buttons ? $('<div class="btn-group"/>').append(button) : button;
	}
});

DataTable.ext.buttons.collection.rightAlignClassName = 'dropdown-menu-right';


return DataTable;
}));


/*!
 * Column visibility buttons for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



$.extend(DataTable.ext.buttons, {
	// A collection of column visibility buttons
	colvis: function (dt, conf) {
		var node = null;
		var buttonConf = {
			extend: 'collection',
			init: function (dt, n) {
				node = n;
			},
			text: function (dt) {
				return dt.i18n('buttons.colvis', 'Column visibility');
			},
			className: 'buttons-colvis',
			closeButton: false,
			buttons: [
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]
		};

		// Rebuild the collection with the new column structure if columns are reordered
		dt.on('column-reorder.dt' + conf.namespace, function () {
			dt.button(null, dt.button(null, node).node()).collectionRebuild([
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]);
		});

		return buttonConf;
	},

	// Selected columns with individual buttons - toggle column visibility
	columnsToggle: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnToggle',
					columns: idx,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to toggle column visibility
	columnToggle: function (dt, conf) {
		return {
			extend: 'columnVisibility',
			columns: conf.columns,
			columnText: conf.columnText
		};
	},

	// Selected columns with individual buttons - set column visibility
	columnsVisibility: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnVisibility',
					columns: idx,
					visibility: conf.visibility,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to set column visibility
	columnVisibility: {
		columns: undefined, // column selector
		text: function (dt, button, conf) {
			return conf._columnText(dt, conf);
		},
		className: 'buttons-columnVisibility',
		action: function (e, dt, button, conf) {
			var col = dt.columns(conf.columns);
			var curr = col.visible();

			col.visible(
				conf.visibility !== undefined ? conf.visibility : !(curr.length ? curr[0] : false)
			);
		},
		init: function (dt, button, conf) {
			var that = this;
			button.attr('data-cv-idx', conf.columns);

			dt.on('column-visibility.dt' + conf.namespace, function (e, settings) {
				if (!settings.bDestroying && settings.nTable == dt.settings()[0].nTable) {
					that.active(dt.column(conf.columns).visible());
				}
			}).on('column-reorder.dt' + conf.namespace, function () {
				// Button has been removed from the DOM
				if (conf.destroying) {
					return;
				}

				if (dt.columns(conf.columns).count() !== 1) {
					return;
				}

				// This button controls the same column index but the text for the column has
				// changed
				that.text(conf._columnText(dt, conf));

				// Since its a different column, we need to check its visibility
				that.active(dt.column(conf.columns).visible());
			});

			this.active(dt.column(conf.columns).visible());
		},
		destroy: function (dt, button, conf) {
			dt.off('column-visibility.dt' + conf.namespace).off(
				'column-reorder.dt' + conf.namespace
			);
		},

		_columnText: function (dt, conf) {
			if (typeof conf.text === 'string') {
				return conf.text;
			}

			var title = dt.column(conf.columns).title();
			var idx = dt.column(conf.columns).index();

			title = title
				.replace(/\n/g, ' ') // remove new lines
				.replace(/<br\s*\/?>/gi, ' ') // replace line breaks with spaces
				.replace(/<select(.*?)<\/select\s*>/gi, ''); // remove select tags, including options text

			// Strip HTML comments
			title = DataTable.Buttons.stripHtmlComments(title);

			// Use whatever HTML stripper DataTables is configured for
			title = DataTable.util.stripHtml(title).trim();

			return conf.columnText ? conf.columnText(dt, idx, title) : title;
		}
	},

	colvisRestore: {
		className: 'buttons-colvisRestore',

		text: function (dt) {
			return dt.i18n('buttons.colvisRestore', 'Restore visibility');
		},

		init: function (dt, button, conf) {
			// Use a private parameter on the column. This gets moved around with the
			// column if ColReorder changes the order
			dt.columns().every(function () {
				var init = this.init();

				if (init.__visOriginal === undefined) {
					init.__visOriginal = this.visible();
				}
			});
		},

		action: function (e, dt, button, conf) {
			dt.columns().every(function (i) {
				var init = this.init();

				this.visible(init.__visOriginal);
			});
		}
	},

	colvisGroup: {
		className: 'buttons-colvisGroup',

		action: function (e, dt, button, conf) {
			dt.columns(conf.show).visible(true, false);
			dt.columns(conf.hide).visible(false, false);

			dt.columns.adjust();
		},

		show: [],

		hide: []
	}
});


return DataTable;
}));


/*! ColReorder 2.0.4
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


/**
 * Mutate an array, moving a set of elements into a new index position
 *
 * @param arr Array to modify
 * @param from Start move index
 * @param count Number of elements to move
 * @param to Index where the start element will move to
 */
function arrayMove(arr, from, count, to) {
    var movers = arr.splice(from, count);
    // Add delete and start to the array, so we can use it for the `apply`
    movers.unshift(0); // splice delete param
    movers.unshift(to < from ? to : to - count + 1); // splice start param
    arr.splice.apply(arr, movers);
}
/**
 * Run finishing activities after one or more columns have been reordered.
 *
 * @param dt DataTable being operated on - must be a single table instance
 */
function finalise(dt) {
    // Cache invalidation. Always read from the data object rather
    // than reading back from the DOM since it could have been
    // changed by a renderer
    dt.rows().invalidate('data');
    // Redraw the header / footer. Its a little bit of a hack this, as DT
    // doesn't expose the header draw as an API method. It calls state
    // saving, so we don't need to here.
    dt.column(0).visible(dt.column(0).visible());
    dt.columns.adjust();
    // Fire an event so other plug-ins can update
    var order = dt.colReorder.order();
    dt.trigger('columns-reordered', [
        {
            order: order,
            mapping: invertKeyValues(order)
        }
    ]);
}
/**
 * Get the original indexes in their current order
 *
 * @param dt DataTable being operated on - must be a single table instance
 * @returns Original indexes in current order
 */
function getOrder(dt) {
    return dt.settings()[0].aoColumns.map(function (col) {
        return col._crOriginalIdx;
    });
}
/**
 * Manipulate a header / footer array in DataTables settings to reorder
 * the columns.
 */
function headerUpdate(structure, map, from, to) {
    var done = [];
    for (var i = 0; i < structure.length; i++) {
        var headerRow = structure[i];
        arrayMove(headerRow, from[0], from.length, to);
        for (var j = 0; j < headerRow.length; j++) {
            var cell = headerRow[j].cell;
            // Only work on a DOM element once, otherwise we risk remapping a
            // remapped value (etc).
            if (done.includes(cell)) {
                continue;
            }
            var indexes = cell.getAttribute('data-dt-column').split(',');
            var mapped = indexes
                .map(function (idx) {
                return map[idx];
            })
                .join(',');
            // Update data attributes for the new column position
            cell.setAttribute('data-dt-column', mapped);
            done.push(cell);
        }
    }
}
/**
 * Setup for ColReorder API operations
 *
 * @param dt DataTable(s) being operated on - might have multiple tables!
 */
function init(api) {
    // Assign the original column index to a parameter that we can lookup.
    // On the first pass (i.e. when the parameter hasn't yet been set), the
    // index order will be the original order, so this is quite a simple
    // assignment.
    api.columns().iterator('column', function (s, idx) {
        var columns = s.aoColumns;
        if (columns[idx]._crOriginalIdx === undefined) {
            columns[idx]._crOriginalIdx = idx;
        }
    });
}
/**
 * Switch the key value pairing of an index array to be value key (i.e. the old value is now the
 * key). For example consider [ 2, 0, 1 ] this would be returned as [ 1, 2, 0 ].
 *
 *  @param   array arr Array to switch around
 */
function invertKeyValues(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result[arr[i]] = i;
    }
    return result;
}
/**
 * Move one or more columns from one index to another.
 *
 * This method has a lot of knowledge about how DataTables works internally.
 * If DataTables changes how it handles cells, columns, etc, then this
 * method would need to be updated accordingly.
 *
 * @param dt DataTable being operated on - must be a single table instance
 * @param from Column indexes to move
 * @param to Destination index (starting if multiple)
 */
function move(dt, from, to) {
    var i, j;
    var settings = dt.settings()[0];
    var columns = settings.aoColumns;
    var newOrder = columns.map(function (col, idx) {
        return idx;
    });
    // The to column in already inside the from column(s) (might be the same)
    // no change required
    if (from.includes(to)) {
        return;
    }
    // A reverse index array so we can look up new indexes from old
    arrayMove(newOrder, from[0], from.length, to);
    var reverseIndexes = invertKeyValues(newOrder);
    // Main column
    arrayMove(columns, from[0], from.length, to);
    // Per row manipulations
    for (i = 0; i < settings.aoData.length; i++) {
        var data = settings.aoData[i];
        // Allow for sparse array
        if (!data) {
            continue;
        }
        var cells = data.anCells;
        // Not yet rendered
        if (!cells) {
            continue;
        }
        // Array of cells
        arrayMove(cells, from[0], from.length, to);
        for (j = 0; j < cells.length; j++) {
            // Reinsert into the document in the new order
            if (data.nTr && cells[j] && columns[j].bVisible) {
                data.nTr.appendChild(cells[j]);
            }
            // Update lookup index
            if (cells[j] && cells[j]._DT_CellIndex) {
                cells[j]._DT_CellIndex.column = j;
            }
        }
    }
    // Per column manipulation
    for (i = 0; i < columns.length; i++) {
        var column = columns[i];
        // Data column sorting
        for (j = 0; j < column.aDataSort.length; j++) {
            column.aDataSort[j] = reverseIndexes[column.aDataSort[j]];
        }
        // Update the column indexes
        column.idx = reverseIndexes[column.idx];
        // Reorder the colgroup > col elements for the new order
        if (column.bVisible) {
            settings.colgroup.append(column.colEl);
        }
    }
    // Header and footer
    headerUpdate(settings.aoHeader, reverseIndexes, from, to);
    headerUpdate(settings.aoFooter, reverseIndexes, from, to);
    // Search - columns
    arrayMove(settings.aoPreSearchCols, from[0], from.length, to);
    // Ordering indexes update - note that the sort listener on the
    // header works out the index to apply on each draw, so it doesn't
    // need to be updated here.
    orderingIndexes(reverseIndexes, settings.aaSorting);
    if (Array.isArray(settings.aaSortingFixed)) {
        orderingIndexes(reverseIndexes, settings.aaSortingFixed);
    }
    else if (settings.aaSortingFixed.pre) {
        orderingIndexes(reverseIndexes, settings.aaSortingFixed.pre);
    }
    else if (settings.aaSortingFixed.post) {
        orderingIndexes(reverseIndexes, settings.aaSortingFixed.pre);
    }
    settings.aLastSort.forEach(function (el) {
        el.src = reverseIndexes[el.src];
    });
    // Fire an event so other plug-ins can update
    dt.trigger('column-reorder', [
        dt.settings()[0],
        {
            from: from,
            to: to,
            mapping: reverseIndexes
        }
    ]);
}
/**
 * Update the indexing for ordering arrays
 *
 * @param map Reverse index map
 * @param order Array to update
 */
function orderingIndexes(map, order) {
    // Can happen if the order was deleted from a saved state
    if (!order) {
        return;
    }
    for (var i = 0; i < order.length; i++) {
        var el = order[i];
        if (typeof el === 'number') {
            // Just a number
            order[i] = map[el];
        }
        else if ($.isPlainObject(el) && el.idx !== undefined) {
            // New index in an object style
            el.idx = map[el.idx];
        }
        else if (Array.isArray(el) && typeof el[0] === 'number') {
            // The good old fixes length array
            el[0] = map[el[0]];
        }
        // No need to update if in object + .name style
    }
}
/**
 * Take an index array for the current positioned, reordered to what you want
 * them to be.
 *
 * @param dt DataTable being operated on - must be a single table instance
 * @param order Indexes from current order, positioned as you want them to be
 */
function setOrder(dt, order, original) {
    var changed = false;
    var i;
    if (order.length !== dt.columns().count()) {
        dt.error('ColReorder - column count mismatch');
        return;
    }
    // The order given is based on the original indexes, rather than the
    // existing ones, so we need to translate from the original to current
    // before then doing the order
    if (original) {
        order = transpose(dt, order, 'toCurrent');
    }
    // The API is array index as the desired position, but our algorithm below is
    // for array index as the current position. So we need to invert for it to work.
    var setOrder = invertKeyValues(order);
    // Move columns, one by one with validation disabled!
    for (i = 0; i < setOrder.length; i++) {
        var currentIndex = setOrder.indexOf(i);
        if (i !== currentIndex) {
            // Reorder our switching error
            arrayMove(setOrder, currentIndex, 1, i);
            // Do the reorder
            move(dt, [currentIndex], i);
            changed = true;
        }
    }
    // Reorder complete
    if (changed) {
        finalise(dt);
    }
}
/**
 * Convert the DataTables header structure array into a 2D array where each
 * element has a reference to its TH/TD cell (regardless of spanning).
 *
 * @param structure Header / footer structure object
 * @returns 2D array of header cells
 */
function structureFill(structure) {
    var filledIn = [];
    for (var row = 0; row < structure.length; row++) {
        filledIn.push([]);
        for (var col = 0; col < structure[row].length; col++) {
            var cell = structure[row][col];
            if (cell) {
                for (var rowInner = 0; rowInner < cell.rowspan; rowInner++) {
                    if (!filledIn[row + rowInner]) {
                        filledIn[row + rowInner] = [];
                    }
                    for (var colInner = 0; colInner < cell.colspan; colInner++) {
                        filledIn[row + rowInner][col + colInner] = cell.cell;
                    }
                }
            }
        }
    }
    return filledIn;
}
/**
 * Convert the index type
 *
 * @param dt DataTable to work on
 * @param idx Index to transform
 * @param dir Transform direction
 * @returns Converted number(s)
 */
function transpose(dt, idx, dir) {
    var order = dt.colReorder.order();
    var columns = dt.settings()[0].aoColumns;
    if (dir === 'toCurrent' || dir === 'fromOriginal') {
        // Given an original index, want the current
        return !Array.isArray(idx)
            ? order.indexOf(idx)
            : idx.map(function (index) {
                return order.indexOf(index);
            });
    }
    // Given a current index, want the original
    return !Array.isArray(idx)
        ? columns[idx]._crOriginalIdx
        : idx.map(function (index) {
            return columns[index]._crOriginalIdx;
        });
}
/**
 * Validate that a requested move is okay. This includes bound checking
 * and that it won't split colspan'ed cells.
 *
 * @param table API instance
 * @param from Column indexes to move
 * @param to Destination index (starting if multiple)
 * @returns Validation result
 */
function validateMove(table, from, to) {
    var columns = table.columns().count();
    // Sanity and bound checking
    if (from[0] < to && to < from[from.length]) {
        return false;
    }
    if (from[0] < 0 && from[from.length - 1] > columns) {
        return false;
    }
    if (to < 0 && to > columns) {
        return false;
    }
    // No change - it's valid
    if (from.includes(to)) {
        return true;
    }
    if (!validateStructureMove(table.table().header.structure(), from, to)) {
        return false;
    }
    if (!validateStructureMove(table.table().footer.structure(), from, to)) {
        return false;
    }
    return true;
}
/**
 * For a given structure check that the move is valid.
 * @param structure
 * @param from
 * @param to
 * @returns
 */
function validateStructureMove(structure, from, to) {
    var header = structureFill(structure);
    var i;
    // Shuffle the header cells around
    for (i = 0; i < header.length; i++) {
        arrayMove(header[i], from[0], from.length, to);
    }
    // Sanity check that the headers are next to each other
    for (i = 0; i < header.length; i++) {
        var seen = [];
        for (var j = 0; j < header[i].length; j++) {
            var cell = header[i][j];
            if (!seen.includes(cell)) {
                // Hasn't been seen before
                seen.push(cell);
            }
            else if (seen[seen.length - 1] !== cell) {
                // Has been seen before and is not the previous cell - validation failed
                return false;
            }
        }
    }
    return true;
}

/**
 * This is one possible UI for column reordering in DataTables. In this case
 * columns are reordered by clicking and dragging a column header. It calculates
 * where columns can be dropped based on the column header used to start the drag
 * and then `colReorder.move()` method to alter the DataTable.
 */
var ColReorder = /** @class */ (function () {
    function ColReorder(dt, opts) {
        this.dom = {
            drag: null
        };
        this.c = {
            columns: null,
            enable: null,
            order: null
        };
        this.s = {
            dropZones: [],
            mouse: {
                absLeft: -1,
                offset: {
                    x: -1,
                    y: -1
                },
                start: {
                    x: -1,
                    y: -1
                },
                target: null,
                targets: []
            },
            scrollInterval: null
        };
        var that = this;
        var ctx = dt.settings()[0];
        // Check if ColReorder already has been initialised on this DataTable - only
        // one can exist.
        if (ctx._colReorder) {
            return;
        }
        dt.settings()[0]._colReorder = this;
        this.dt = dt;
        $.extend(this.c, ColReorder.defaults, opts);
        init(dt);
        dt.on('stateSaveParams', function (e, s, d) {
            d.colReorder = getOrder(dt);
        });
        dt.on('destroy', function () {
            dt.off('.colReorder');
            dt.colReorder.reset();
        });
        // Initial ordering / state restoring
        var loaded = dt.state.loaded();
        var order = this.c.order;
        if (loaded && loaded.colReorder) {
            order = loaded.colReorder;
        }
        if (order) {
            dt.ready(function () {
                setOrder(dt, order, true);
            });
        }
        dt.table()
            .header.structure()
            .forEach(function (row) {
            for (var i = 0; i < row.length; i++) {
                if (row[i] && row[i].cell) {
                    that._addListener(row[i].cell);
                }
            }
        });
    }
    ColReorder.prototype.disable = function () {
        this.c.enable = false;
        return this;
    };
    ColReorder.prototype.enable = function (flag) {
        if (flag === void 0) { flag = true; }
        if (flag === false) {
            return this.disable();
        }
        this.c.enable = true;
        return this;
    };
    /**
     * Attach the mouse down listener to an element to start a column reorder action
     *
     * @param el
     */
    ColReorder.prototype._addListener = function (el) {
        var that = this;
        $(el)
            .on('selectstart.colReorder', function () {
            return false;
        })
            .on('mousedown.colReorder touchstart.colReorder', function (e) {
            // Ignore middle and right click
            if (e.type === 'mousedown' && e.which !== 1) {
                return;
            }
            // Ignore if disabled
            if (!that.c.enable) {
                return;
            }
            that._mouseDown(e, this);
        });
    };
    /**
     * Create the element that is dragged around the page
     */
    ColReorder.prototype._createDragNode = function () {
        var origCell = this.s.mouse.target;
        var origTr = origCell.parent();
        var origThead = origTr.parent();
        var origTable = origThead.parent();
        var cloneCell = origCell.clone();
        // This is a slightly odd combination of jQuery and DOM, but it is the
        // fastest and least resource intensive way I could think of cloning
        // the table with just a single header cell in it.
        this.dom.drag = $(origTable[0].cloneNode(false))
            .addClass('dtcr-cloned')
            .append($(origThead[0].cloneNode(false)).append($(origTr[0].cloneNode(false)).append(cloneCell[0])) // Not sure why  it doesn't want to append a jQuery node
        )
            .css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: $(origCell).outerWidth(),
            height: $(origCell).outerHeight()
        })
            .appendTo('body');
    };
    /**
     * Get cursor position regardless of mouse or touch input
     *
     * @param e Event
     * @param prop Property name to get
     * @returns Value - assuming a number here
     */
    ColReorder.prototype._cursorPosition = function (e, prop) {
        return e.type.indexOf('touch') !== -1 ? e.originalEvent.touches[0][prop] : e[prop];
    };
    /**
     * Cache values at start
     *
     * @param e Triggering event
     * @param cell Cell that the action started on
     * @returns
     */
    ColReorder.prototype._mouseDown = function (e, cell) {
        var _this = this;
        var target = $(e.target).closest('th, td');
        var offset = target.offset();
        var moveableColumns = this.dt.columns(this.c.columns).indexes().toArray();
        var moveColumnIndexes = $(cell)
            .attr('data-dt-column')
            .split(',')
            .map(function (val) {
            return parseInt(val, 10);
        });
        // Don't do anything for columns which are not selected as moveable
        for (var j = 0; j < moveColumnIndexes.length; j++) {
            if (!moveableColumns.includes(moveColumnIndexes[j])) {
                return false;
            }
        }
        this.s.mouse.start.x = this._cursorPosition(e, 'pageX');
        this.s.mouse.start.y = this._cursorPosition(e, 'pageY');
        this.s.mouse.offset.x = this._cursorPosition(e, 'pageX') - offset.left;
        this.s.mouse.offset.y = this._cursorPosition(e, 'pageY') - offset.top;
        this.s.mouse.target = target;
        this.s.mouse.targets = moveColumnIndexes;
        // Classes to highlight the columns being moved
        for (var i = 0; i < moveColumnIndexes.length; i++) {
            var cells = this.dt
                .cells(null, moveColumnIndexes[i], { page: 'current' })
                .nodes()
                .to$();
            var klass = 'dtcr-moving';
            if (i === 0) {
                klass += ' dtcr-moving-first';
            }
            if (i === moveColumnIndexes.length - 1) {
                klass += ' dtcr-moving-last';
            }
            cells.addClass(klass);
        }
        this._regions(moveColumnIndexes);
        this._scrollRegions();
        /* Add event handlers to the document */
        $(document)
            .on('mousemove.colReorder touchmove.colReorder', function (e) {
            _this._mouseMove(e);
        })
            .on('mouseup.colReorder touchend.colReorder', function (e) {
            _this._mouseUp(e);
        });
    };
    ColReorder.prototype._mouseMove = function (e) {
        if (this.dom.drag === null) {
            // Only create the drag element if the mouse has moved a specific distance from the start
            // point - this allows the user to make small mouse movements when sorting and not have a
            // possibly confusing drag element showing up
            if (Math.pow(Math.pow(this._cursorPosition(e, 'pageX') - this.s.mouse.start.x, 2) +
                Math.pow(this._cursorPosition(e, 'pageY') - this.s.mouse.start.y, 2), 0.5) < 5) {
                return;
            }
            $(document.body).addClass('dtcr-dragging');
            this._createDragNode();
        }
        // Position the element - we respect where in the element the click occurred
        this.dom.drag.css({
            left: this._cursorPosition(e, 'pageX') - this.s.mouse.offset.x,
            top: this._cursorPosition(e, 'pageY') - this.s.mouse.offset.y
        });
        // Find cursor's left position relative to the table
        var tableOffset = $(this.dt.table().node()).offset().left;
        var cursorMouseLeft = this._cursorPosition(e, 'pageX') - tableOffset;
        var dropZone = this.s.dropZones.find(function (zone) {
            if (zone.left <= cursorMouseLeft && cursorMouseLeft <= zone.left + zone.width) {
                return true;
            }
            return false;
        });
        this.s.mouse.absLeft = this._cursorPosition(e, 'pageX');
        if (!dropZone) {
            return;
        }
        if (!dropZone.self) {
            this._move(dropZone, cursorMouseLeft);
        }
    };
    ColReorder.prototype._mouseUp = function (e) {
        $(document).off('.colReorder');
        $(document.body).removeClass('dtcr-dragging');
        if (this.dom.drag) {
            this.dom.drag.remove();
            this.dom.drag = null;
        }
        if (this.s.scrollInterval) {
            clearInterval(this.s.scrollInterval);
        }
        this.dt.cells('.dtcr-moving').nodes().to$().removeClass('dtcr-moving dtcr-moving-first dtcr-moving-last');
    };
    /**
     * Shift columns around
     *
     * @param dropZone Where to move to
     * @param cursorMouseLeft Cursor position, relative to the left of the table
     */
    ColReorder.prototype._move = function (dropZone, cursorMouseLeft) {
        var that = this;
        this.dt.colReorder.move(this.s.mouse.targets, dropZone.colIdx);
        // Update the targets
        this.s.mouse.targets = $(this.s.mouse.target)
            .attr('data-dt-column')
            .split(',')
            .map(function (val) {
            return parseInt(val, 10);
        });
        this._regions(this.s.mouse.targets);
        var visibleTargets = this.s.mouse.targets.filter(function (val) {
            return that.dt.column(val).visible();
        });
        // If the column being moved is smaller than the column it is replacing,
        // the drop zones might need a correction to allow for this since, otherwise
        // we might immediately be changing the column order as soon as it was placed.
        // Find the drop zone for the first in the list of targets - is its
        // left greater than the mouse position. If so, it needs correcting
        var dz = this.s.dropZones.find(function (zone) {
            return zone.colIdx === visibleTargets[0];
        });
        var dzIdx = this.s.dropZones.indexOf(dz);
        if (dz.left > cursorMouseLeft) {
            var previousDiff = dz.left - cursorMouseLeft;
            var previousDz = this.s.dropZones[dzIdx - 1];
            dz.left -= previousDiff;
            dz.width += previousDiff;
            if (previousDz) {
                previousDz.width -= previousDiff;
            }
        }
        // And for the last in the list
        dz = this.s.dropZones.find(function (zone) {
            return zone.colIdx === visibleTargets[visibleTargets.length - 1];
        });
        if (dz.left + dz.width < cursorMouseLeft) {
            var nextDiff = cursorMouseLeft - (dz.left + dz.width);
            var nextDz = this.s.dropZones[dzIdx + 1];
            dz.width += nextDiff;
            if (nextDz) {
                nextDz.left += nextDiff;
                nextDz.width -= nextDiff;
            }
        }
    };
    /**
     * Determine the boundaries for where drops can happen and where they would
     * insert into.
     */
    ColReorder.prototype._regions = function (moveColumns) {
        var that = this;
        var dropZones = [];
        var totalWidth = 0;
        var negativeCorrect = 0;
        var allowedColumns = this.dt.columns(this.c.columns).indexes().toArray();
        var widths = this.dt.columns().widths();
        // Each column is a drop zone
        this.dt.columns().every(function (colIdx, tabIdx, i) {
            if (!this.visible()) {
                return;
            }
            var columnWidth = widths[colIdx];
            // Check that we are allowed to move into this column - if not, need
            // to offset the widths
            if (!allowedColumns.includes(colIdx)) {
                totalWidth += columnWidth;
                return;
            }
            var valid = validateMove(that.dt, moveColumns, colIdx);
            if (valid) {
                // New drop zone. Note that it might have it's offset moved
                // by the final condition in this logic set
                dropZones.push({
                    colIdx: colIdx,
                    left: totalWidth - negativeCorrect,
                    self: moveColumns[0] <= colIdx && colIdx <= moveColumns[moveColumns.length - 1],
                    width: columnWidth + negativeCorrect
                });
            }
            else if (colIdx < moveColumns[0]) {
                // Not valid and before the column(s) to be moved - the drop
                // zone for the previous valid drop point is extended
                if (dropZones.length) {
                    dropZones[dropZones.length - 1].width += columnWidth;
                }
            }
            else if (colIdx > moveColumns[moveColumns.length - 1]) {
                // Not valid and after the column(s) to be moved - the next
                // drop zone to be created will be extended
                negativeCorrect += columnWidth;
            }
            totalWidth += columnWidth;
        });
        this.s.dropZones = dropZones;
        // this._drawDropZones();
    };
    /**
     * Check if the table is scrolling or not. It is it the `table` isn't the same for
     * the header and body parents.
     *
     * @returns
     */
    ColReorder.prototype._isScrolling = function () {
        return this.dt.table().body().parentNode !== this.dt.table().header().parentNode;
    };
    /**
     * Set an interval clock that will check to see if the scrolling of the table body should be moved
     * as the mouse moves on the scroll (allowing a drag and drop to columns which aren't yet visible)
     */
    ColReorder.prototype._scrollRegions = function () {
        if (!this._isScrolling()) {
            // Not scrolling - nothing to do
            return;
        }
        var that = this;
        var tableLeft = $(this.dt.table().container()).position().left;
        var tableWidth = $(this.dt.table().container()).outerWidth();
        var mouseBuffer = 75;
        var scrollContainer = this.dt.table().body().parentElement.parentElement;
        this.s.scrollInterval = setInterval(function () {
            var mouseLeft = that.s.mouse.absLeft;
            if (mouseLeft < tableLeft + mouseBuffer && scrollContainer.scrollLeft) {
                scrollContainer.scrollLeft -= 5;
            }
            else if (mouseLeft > tableLeft + tableWidth - mouseBuffer &&
                scrollContainer.scrollLeft < scrollContainer.scrollWidth) {
                scrollContainer.scrollLeft += 5;
            }
        }, 25);
    };
    // This is handy for debugging where the drop zones actually are!
    // private _drawDropZones () {
    // 	let dropZones = this.s.dropZones;
    // 	$('div.allan').remove();
    // 	for (let i=0 ; i<dropZones.length ; i++) {
    // 		let zone = dropZones[i];
    // 		$(this.dt.table().container()).append(
    // 			$('<div>')
    // 				.addClass('allan')
    // 				.css({
    // 					position: 'absolute',
    // 					top: 0,
    // 					width: zone.width - 4,
    // 					height: 20,
    // 					left: zone.left + 2,
    // 					border: '1px solid red',
    // 				})
    // 		);
    // 	}
    // }
    ColReorder.defaults = {
        columns: '',
        enable: true,
        order: null
    };
    ColReorder.version = '2.0.4';
    return ColReorder;
}());

/*! ColReorder 2.0.4
 * © SpryMedia Ltd - datatables.net/license
 */
/**
 * @summary     ColReorder
 * @description Provide the ability to reorder columns in a DataTable
 * @version     2.0.4
 * @author      SpryMedia Ltd
 * @contact     datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */
 // declare var DataTable: any;
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * UI interaction class
 */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API integration
 */
/** Enable mouse column reordering */
DataTable.Api.register('colReorder.enable()', function (flag) {
    return this.iterator('table', function (ctx) {
        if (ctx._colReorder) {
            ctx._colReorder.enable(flag);
        }
    });
});
/** Disable mouse column reordering */
DataTable.Api.register('colReorder.disable()', function () {
    return this.iterator('table', function (ctx) {
        if (ctx._colReorder) {
            ctx._colReorder.disable();
        }
    });
});
/**
 * Change the ordering of the columns in the DataTable.
 */
DataTable.Api.register('colReorder.move()', function (from, to) {
    init(this);
    if (!Array.isArray(from)) {
        from = [from];
    }
    if (!validateMove(this, from, to)) {
        this.error('ColReorder - invalid move');
        return this;
    }
    return this.tables().every(function () {
        move(this, from, to);
        finalise(this);
    });
});
DataTable.Api.register('colReorder.order()', function (set, original) {
    init(this);
    if (!set) {
        return this.context.length ? getOrder(this) : null;
    }
    return this.tables().every(function () {
        setOrder(this, set, original);
    });
});
DataTable.Api.register('colReorder.reset()', function () {
    init(this);
    return this.tables().every(function () {
        var order = this.columns()
            .every(function (i) {
            return i;
        })
            .flatten()
            .toArray();
        setOrder(this, order, true);
    });
});
DataTable.Api.register('colReorder.transpose()', function (idx, dir) {
    init(this);
    if (!dir) {
        dir = 'toCurrent';
    }
    return transpose(this, idx, dir);
});
DataTable.ColReorder = ColReorder;
// Called when DataTables is going to load a state. That might be
// before the table is ready (state saving) or after (state restoring).
// Also note that it happens _before_ preInit (below).
$(document).on('stateLoadInit.dt', function (e, settings, state) {
    if (e.namespace !== 'dt') {
        return;
    }
    var dt = new DataTable.Api(settings);
    if (state.colReorder) {
        if (dt.ready()) {
            // Table is fully loaded - do the column reordering here
            // so that the stored indexes are in the correct place
            // e.g. column visibility
            setOrder(dt, state.colReorder, true);
        }
        else {
            // If the table is not ready, column reordering is done
            // after it becomes fully ready. That means that saved
            // column indexes need to be updated for where those columns
            // currently are. Any properties which refer to column indexes
            // would need to be updated here.
            // State's ordering indexes
            orderingIndexes(state.colReorder, state.order);
            // State's columns array - sort by restore index
            if (state.columns) {
                for (var i = 0; i < state.columns.length; i++) {
                    state.columns[i]._cr_sort = state.colReorder[i];
                }
                state.columns.sort(function (a, b) {
                    return a._cr_sort - b._cr_sort;
                });
            }
        }
    }
});
$(document).on('preInit.dt', function (e, settings) {
    if (e.namespace !== 'dt') {
        return;
    }
    var init = settings.oInit.colReorder;
    var defaults = DataTable.defaults.colReorder;
    if (init || defaults) {
        var opts = $.extend({}, defaults, init);
        if (init !== false) {
            var dt = new DataTable.Api(settings);
            new ColReorder(dt, opts);
        }
    }
});


return DataTable;
}));


/*! FixedColumns 5.0.4
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


(function () {
    'use strict';

    var $$1;
    var DataTable$1;
    function setJQuery(jq) {
        $$1 = jq;
        DataTable$1 = $$1.fn.dataTable;
    }
    var FixedColumns = /** @class */ (function () {
        function FixedColumns(settings, opts) {
            var _this = this;
            // Check that the required version of DataTables is included
            if (!DataTable$1 ||
                !DataTable$1.versionCheck ||
                !DataTable$1.versionCheck('2')) {
                throw new Error('FixedColumns requires DataTables 2 or newer');
            }
            var table = new DataTable$1.Api(settings);
            this.classes = $$1.extend(true, {}, FixedColumns.classes);
            // Get options from user
            this.c = $$1.extend(true, {}, FixedColumns.defaults, opts);
            this.s = {
                dt: table,
                rtl: $$1(table.table().node()).css('direction') === 'rtl'
            };
            // Backwards compatibility for deprecated options
            if (opts && opts.leftColumns !== undefined) {
                opts.left = opts.leftColumns;
            }
            if (opts && opts.left !== undefined) {
                this.c[this.s.rtl ? 'end' : 'start'] = opts.left;
            }
            if (opts && opts.rightColumns !== undefined) {
                opts.right = opts.rightColumns;
            }
            if (opts && opts.right !== undefined) {
                this.c[this.s.rtl ? 'start' : 'end'] = opts.right;
            }
            this.dom = {
                bottomBlocker: $$1('<div>').addClass(this.classes.bottomBlocker),
                topBlocker: $$1('<div>').addClass(this.classes.topBlocker),
                scroller: $$1('div.dt-scroll-body', this.s.dt.table().container())
            };
            if (this.s.dt.settings()[0]._bInitComplete) {
                // Fixed Columns Initialisation
                this._addStyles();
                this._setKeyTableListener();
            }
            else {
                table.one('init.dt.dtfc', function () {
                    // Fixed Columns Initialisation
                    _this._addStyles();
                    _this._setKeyTableListener();
                });
            }
            // Lots or reasons to redraw the column styles
            table.on('column-sizing.dt.dtfc column-reorder.dt.dtfc draw.dt.dtfc', function () { return _this._addStyles(); });
            // Column visibility can trigger a number of times quickly, so we debounce it
            var debounced = DataTable$1.util.debounce(function () {
                _this._addStyles();
            }, 50);
            table.on('column-visibility.dt.dtfc', function () {
                debounced();
            });
            // Add classes to indicate scrolling state for styling
            this.dom.scroller.on('scroll.dtfc', function () { return _this._scroll(); });
            this._scroll();
            // Make class available through dt object
            table.settings()[0]._fixedColumns = this;
            table.on('destroy', function () { return _this._destroy(); });
            return this;
        }
        FixedColumns.prototype.end = function (newVal) {
            // If the value is to change
            if (newVal !== undefined) {
                if (newVal >= 0 && newVal <= this.s.dt.columns().count()) {
                    // Set the new values and redraw the columns
                    this.c.end = newVal;
                    this._addStyles();
                }
                return this;
            }
            return this.c.end;
        };
        /**
         * Left fix - accounting for RTL
         *
         * @param count Columns to fix, or undefined for getter
         */
        FixedColumns.prototype.left = function (count) {
            return this.s.rtl
                ? this.end(count)
                : this.start(count);
        };
        /**
         * Right fix - accounting for RTL
         *
         * @param count Columns to fix, or undefined for getter
         */
        FixedColumns.prototype.right = function (count) {
            return this.s.rtl
                ? this.start(count)
                : this.end(count);
        };
        FixedColumns.prototype.start = function (newVal) {
            // If the value is to change
            if (newVal !== undefined) {
                if (newVal >= 0 && newVal <= this.s.dt.columns().count()) {
                    // Set the new values and redraw the columns
                    this.c.start = newVal;
                    this._addStyles();
                }
                return this;
            }
            return this.c.start;
        };
        /**
         * Iterates over the columns, fixing the appropriate ones to the left and right
         */
        FixedColumns.prototype._addStyles = function () {
            var dt = this.s.dt;
            var that = this;
            var colCount = this.s.dt.columns(':visible').count();
            var headerStruct = dt.table().header.structure(':visible');
            var footerStruct = dt.table().footer.structure(':visible');
            var widths = dt.columns(':visible').widths().toArray();
            var wrapper = $$1(dt.table().node()).closest('div.dt-scroll');
            var scroller = $$1(dt.table().node()).closest('div.dt-scroll-body')[0];
            var rtl = this.s.rtl;
            var start = this.c.start;
            var end = this.c.end;
            var left = rtl ? end : start;
            var right = rtl ? start : end;
            var barWidth = dt.settings()[0].oBrowser.barWidth; // dt internal
            // Do nothing if no scrolling in the DataTable
            if (wrapper.length === 0) {
                return this;
            }
            // Bar not needed - no vertical scrolling
            if (scroller.offsetWidth === scroller.clientWidth) {
                barWidth = 0;
            }
            // Loop over the visible columns, setting their state
            dt.columns().every(function (colIdx) {
                var visIdx = dt.column.index('toVisible', colIdx);
                var offset;
                // Skip the hidden columns
                if (visIdx === null) {
                    return;
                }
                if (visIdx < start) {
                    // Fix to the start
                    offset = that._sum(widths, visIdx);
                    that._fixColumn(visIdx, offset, 'start', headerStruct, footerStruct, barWidth);
                }
                else if (visIdx >= colCount - end) {
                    // Fix to the end
                    offset = that._sum(widths, colCount - visIdx - 1, true);
                    that._fixColumn(visIdx, offset, 'end', headerStruct, footerStruct, barWidth);
                }
                else {
                    // Release
                    that._fixColumn(visIdx, 0, 'none', headerStruct, footerStruct, barWidth);
                }
            });
            // Apply classes to table to indicate what state we are in
            $$1(dt.table().node())
                .toggleClass(that.classes.tableFixedStart, start > 0)
                .toggleClass(that.classes.tableFixedEnd, end > 0)
                .toggleClass(that.classes.tableFixedLeft, left > 0)
                .toggleClass(that.classes.tableFixedRight, right > 0);
            // Blocker elements for when scroll bars are always visible
            var headerEl = dt.table().header();
            var footerEl = dt.table().footer();
            var headerHeight = $$1(headerEl).outerHeight();
            var footerHeight = $$1(footerEl).outerHeight();
            this.dom.topBlocker
                .appendTo(wrapper)
                .css('top', 0)
                .css(this.s.rtl ? 'left' : 'right', 0)
                .css('height', headerHeight)
                .css('width', barWidth + 1)
                .css('display', barWidth ? 'block' : 'none');
            if (footerEl) {
                this.dom.bottomBlocker
                    .appendTo(wrapper)
                    .css('bottom', 0)
                    .css(this.s.rtl ? 'left' : 'right', 0)
                    .css('height', footerHeight)
                    .css('width', barWidth + 1)
                    .css('display', barWidth ? 'block' : 'none');
            }
        };
        /**
         * Clean up
         */
        FixedColumns.prototype._destroy = function () {
            this.s.dt.off('.dtfc');
            this.dom.scroller.off('.dtfc');
            $$1(this.s.dt.table().node())
                .removeClass(this.classes.tableScrollingEnd + ' ' +
                this.classes.tableScrollingLeft + ' ' +
                this.classes.tableScrollingStart + ' ' +
                this.classes.tableScrollingRight);
            this.dom.bottomBlocker.remove();
            this.dom.topBlocker.remove();
        };
        /**
         * Fix or unfix a column
         *
         * @param idx Column visible index to operate on
         * @param offset Offset from the start (pixels)
         * @param side start, end or none to unfix a column
         * @param header DT header structure object
         * @param footer DT footer structure object
         */
        FixedColumns.prototype._fixColumn = function (idx, offset, side, header, footer, barWidth) {
            var _this = this;
            var dt = this.s.dt;
            var applyStyles = function (jq, part) {
                if (side === 'none') {
                    jq.css('position', '')
                        .css('left', '')
                        .css('right', '')
                        .removeClass(_this.classes.fixedEnd + ' ' +
                        _this.classes.fixedLeft + ' ' +
                        _this.classes.fixedRight + ' ' +
                        _this.classes.fixedStart);
                }
                else {
                    var positionSide = side === 'start' ? 'left' : 'right';
                    if (_this.s.rtl) {
                        positionSide = side === 'start' ? 'right' : 'left';
                    }
                    var off = offset;
                    if (side === 'end' && (part === 'header' || part === 'footer')) {
                        off += barWidth;
                    }
                    jq.css('position', 'sticky')
                        .css(positionSide, off)
                        .addClass(side === 'start'
                        ? _this.classes.fixedStart
                        : _this.classes.fixedEnd)
                        .addClass(positionSide === 'left'
                        ? _this.classes.fixedLeft
                        : _this.classes.fixedRight);
                }
            };
            header.forEach(function (row) {
                if (row[idx]) {
                    applyStyles($$1(row[idx].cell), 'header');
                }
            });
            applyStyles(dt.column(idx + ':visible', { page: 'current' }).nodes().to$(), 'body');
            if (footer) {
                footer.forEach(function (row) {
                    if (row[idx]) {
                        applyStyles($$1(row[idx].cell), 'footer');
                    }
                });
            }
        };
        /**
         * Update classes on the table to indicate if the table is scrolling or not
         */
        FixedColumns.prototype._scroll = function () {
            var scroller = this.dom.scroller[0];
            // Not a scrolling table
            if (!scroller) {
                return;
            }
            // Need to update the classes on potentially multiple table tags. There is the
            // main one, the scrolling ones and if FixedHeader is active, the holding
            // position ones! jQuery will deduplicate for us.
            var table = $$1(this.s.dt.table().node())
                .add(this.s.dt.table().header().parentNode)
                .add(this.s.dt.table().footer().parentNode)
                .add('div.dt-scroll-headInner table', this.s.dt.table().container())
                .add('div.dt-scroll-footInner table', this.s.dt.table().container());
            var scrollLeft = scroller.scrollLeft; // 0 when fully scrolled left
            var ltr = !this.s.rtl;
            var scrollStart = scrollLeft !== 0;
            var scrollEnd = scroller.scrollWidth > (scroller.clientWidth + Math.abs(scrollLeft) + 1); // extra 1 for Chrome
            table.toggleClass(this.classes.tableScrollingStart, scrollStart);
            table.toggleClass(this.classes.tableScrollingEnd, scrollEnd);
            table.toggleClass(this.classes.tableScrollingLeft, (scrollStart && ltr) || (scrollEnd && !ltr));
            table.toggleClass(this.classes.tableScrollingRight, (scrollEnd && ltr) || (scrollStart && !ltr));
        };
        FixedColumns.prototype._setKeyTableListener = function () {
            var _this = this;
            this.s.dt.on('key-focus.dt.dtfc', function (e, dt, cell) {
                var currScroll;
                var cellPos = $$1(cell.node()).offset();
                var scroller = _this.dom.scroller[0];
                var scroll = $$1($$1(_this.s.dt.table().node()).closest('div.dt-scroll-body'));
                // If there are fixed columns to the left
                if (_this.c.start > 0) {
                    // Get the rightmost left fixed column header, it's position and it's width
                    var rightMost = $$1(_this.s.dt.column(_this.c.start - 1).header());
                    var rightMostPos = rightMost.offset();
                    var rightMostWidth = rightMost.outerWidth();
                    // If the current highlighted cell is left of the rightmost cell on the screen
                    if ($$1(cell.node()).hasClass(_this.classes.fixedLeft)) {
                        // Fixed columns have the scrollbar at the start, always
                        scroll.scrollLeft(0);
                    }
                    else if (cellPos.left < rightMostPos.left + rightMostWidth) {
                        // Scroll it into view
                        currScroll = scroll.scrollLeft();
                        scroll.scrollLeft(currScroll -
                            (rightMostPos.left + rightMostWidth - cellPos.left));
                    }
                }
                // If there are fixed columns to the right
                if (_this.c.end > 0) {
                    // Get the number of columns and the width of the cell as doing right side calc
                    var numCols = _this.s.dt.columns().data().toArray().length;
                    var cellWidth = $$1(cell.node()).outerWidth();
                    // Get the leftmost right fixed column header and it's position
                    var leftMost = $$1(_this.s.dt.column(numCols - _this.c.end).header());
                    var leftMostPos = leftMost.offset();
                    // If the current highlighted cell is right of the leftmost cell on the screen
                    if ($$1(cell.node()).hasClass(_this.classes.fixedRight)) {
                        scroll.scrollLeft(scroller.scrollWidth - scroller.clientWidth);
                    }
                    else if (cellPos.left + cellWidth > leftMostPos.left) {
                        // Scroll it into view
                        currScroll = scroll.scrollLeft();
                        scroll.scrollLeft(currScroll -
                            (leftMostPos.left - (cellPos.left + cellWidth)));
                    }
                }
            });
        };
        /**
         * Sum a range of values from an array
         *
         * @param widths
         * @param index
         * @returns
         */
        FixedColumns.prototype._sum = function (widths, index, reverse) {
            if (reverse === void 0) { reverse = false; }
            if (reverse) {
                widths = widths.slice().reverse();
            }
            return widths.slice(0, index).reduce(function (accum, val) { return accum + val; }, 0);
        };
        FixedColumns.version = '5.0.4';
        FixedColumns.classes = {
            bottomBlocker: 'dtfc-bottom-blocker',
            fixedEnd: 'dtfc-fixed-end',
            fixedLeft: 'dtfc-fixed-left',
            fixedRight: 'dtfc-fixed-right',
            fixedStart: 'dtfc-fixed-start',
            tableFixedEnd: 'dtfc-has-end',
            tableFixedLeft: 'dtfc-has-left',
            tableFixedRight: 'dtfc-has-right',
            tableFixedStart: 'dtfc-has-start',
            tableScrollingEnd: 'dtfc-scrolling-end',
            tableScrollingLeft: 'dtfc-scrolling-left',
            tableScrollingRight: 'dtfc-scrolling-right',
            tableScrollingStart: 'dtfc-scrolling-start',
            topBlocker: 'dtfc-top-blocker'
        };
        FixedColumns.defaults = {
            i18n: {
                button: 'FixedColumns'
            },
            start: 1,
            end: 0
        };
        return FixedColumns;
    }());

    /*! FixedColumns 5.0.4
     * © SpryMedia Ltd - datatables.net/license
     */
    setJQuery($);
    $.fn.dataTable.FixedColumns = FixedColumns;
    $.fn.DataTable.FixedColumns = FixedColumns;
    var apiRegister = DataTable.Api.register;
    apiRegister('fixedColumns()', function () {
        return this;
    });
    apiRegister('fixedColumns().start()', function (newVal) {
        var ctx = this.context[0];
        if (newVal !== undefined) {
            ctx._fixedColumns.start(newVal);
            return this;
        }
        else {
            return ctx._fixedColumns.start();
        }
    });
    apiRegister('fixedColumns().end()', function (newVal) {
        var ctx = this.context[0];
        if (newVal !== undefined) {
            ctx._fixedColumns.end(newVal);
            return this;
        }
        else {
            return ctx._fixedColumns.end();
        }
    });
    apiRegister('fixedColumns().left()', function (newVal) {
        var ctx = this.context[0];
        if (newVal !== undefined) {
            ctx._fixedColumns.left(newVal);
            return this;
        }
        else {
            return ctx._fixedColumns.left();
        }
    });
    apiRegister('fixedColumns().right()', function (newVal) {
        var ctx = this.context[0];
        if (newVal !== undefined) {
            ctx._fixedColumns.right(newVal);
            return this;
        }
        else {
            return ctx._fixedColumns.right();
        }
    });
    DataTable.ext.buttons.fixedColumns = {
        action: function (e, dt, node, config) {
            if ($(node).attr('active')) {
                $(node).removeAttr('active').removeClass('active');
                dt.fixedColumns().start(0);
                dt.fixedColumns().end(0);
            }
            else {
                $(node).attr('active', 'true').addClass('active');
                dt.fixedColumns().start(config.config.start);
                dt.fixedColumns().end(config.config.end);
            }
        },
        config: {
            start: 1,
            end: 0
        },
        init: function (dt, node, config) {
            if (dt.settings()[0]._fixedColumns === undefined) {
                _init(dt.settings(), config);
            }
            $(node).attr('active', 'true').addClass('active');
            dt.button(node).text(config.text || dt.i18n('buttons.fixedColumns', dt.settings()[0]._fixedColumns.c.i18n.button));
        },
        text: null
    };
    function _init(settings, options) {
        if (options === void 0) { options = null; }
        var api = new DataTable.Api(settings);
        var opts = options
            ? options
            : api.init().fixedColumns || DataTable.defaults.fixedColumns;
        var fixedColumns = new FixedColumns(api, opts);
        return fixedColumns;
    }
    // Attach a listener to the document which listens for DataTables initialisation
    // events so we can automatically initialise
    $(document).on('plugin-init.dt', function (e, settings) {
        if (e.namespace !== 'dt') {
            return;
        }
        if (settings.oInit.fixedColumns ||
            DataTable.defaults.fixedColumns) {
            if (!settings._fixedColumns) {
                _init(settings, null);
            }
        }
    });

})();


return DataTable;
}));


/*! FixedHeader 4.0.1
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     FixedHeader
 * @description Fix a table's header or footer, so it is always visible while
 *              scrolling
 * @version     4.0.1
 * @author      SpryMedia Ltd
 * @contact     datatables.net
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

var _instCounter = 0;

var FixedHeader = function (dt, config) {
	if (!DataTable.versionCheck('2')) {
		throw 'Warning: FixedHeader requires DataTables 2 or newer';
	}

	// Sanity check - you just know it will happen
	if (!(this instanceof FixedHeader)) {
		throw "FixedHeader must be initialised with the 'new' keyword.";
	}

	// Allow a boolean true for defaults
	if (config === true) {
		config = {};
	}

	dt = new DataTable.Api(dt);

	this.c = $.extend(true, {}, FixedHeader.defaults, config);

	this.s = {
		dt: dt,
		position: {
			theadTop: 0,
			tbodyTop: 0,
			tfootTop: 0,
			tfootBottom: 0,
			width: 0,
			left: 0,
			tfootHeight: 0,
			theadHeight: 0,
			windowHeight: $(window).height(),
			visible: true
		},
		headerMode: null,
		footerMode: null,
		autoWidth: dt.settings()[0].oFeatures.bAutoWidth,
		namespace: '.dtfc' + _instCounter++,
		scrollLeft: {
			header: -1,
			footer: -1
		},
		enable: true,
		autoDisable: false
	};

	this.dom = {
		floatingHeader: null,
		thead: $(dt.table().header()),
		tbody: $(dt.table().body()),
		tfoot: $(dt.table().footer()),
		header: {
			host: null,
			floating: null,
			floatingParent: $('<div class="dtfh-floatingparent"><div></div></div>'),
			placeholder: null
		},
		footer: {
			host: null,
			floating: null,
			floatingParent: $('<div class="dtfh-floatingparent"><div></div></div>'),
			placeholder: null
		}
	};

	this.dom.header.host = this.dom.thead.parent();
	this.dom.footer.host = this.dom.tfoot.parent();

	var dtSettings = dt.settings()[0];
	if (dtSettings._fixedHeader) {
		throw (
			'FixedHeader already initialised on table ' + dtSettings.nTable.id
		);
	}

	dtSettings._fixedHeader = this;

	this._constructor();
};

/*
 * Variable: FixedHeader
 * Purpose:  Prototype for FixedHeader
 * Scope:    global
 */
$.extend(FixedHeader.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods
	 */

	/**
	 * Kill off FH and any events
	 */
	destroy: function () {
		var dom = this.dom;

		this.s.dt.off('.dtfc');
		$(window).off(this.s.namespace);

		// Remove clones of FC blockers
		if (dom.header.rightBlocker) {
			dom.header.rightBlocker.remove();
		}
		if (dom.header.leftBlocker) {
			dom.header.leftBlocker.remove();
		}
		if (dom.footer.rightBlocker) {
			dom.footer.rightBlocker.remove();
		}
		if (dom.footer.leftBlocker) {
			dom.footer.leftBlocker.remove();
		}

		if (this.c.header) {
			this._modeChange('in-place', 'header', true);
		}

		if (this.c.footer && dom.tfoot.length) {
			this._modeChange('in-place', 'footer', true);
		}
	},

	/**
	 * Enable / disable the fixed elements
	 *
	 * @param  {boolean} enable `true` to enable, `false` to disable
	 */
	enable: function (enable, update, type) {
		this.s.enable = enable;

		this.s.enableType = type;

		if (update || update === undefined) {
			this._positions();
			this._scroll(true);
		}
	},

	/**
	 * Get enabled status
	 */
	enabled: function () {
		return this.s.enable;
	},

	/**
	 * Set header offset
	 *
	 * @param  {int} new value for headerOffset
	 */
	headerOffset: function (offset) {
		if (offset !== undefined) {
			this.c.headerOffset = offset;
			this.update();
		}

		return this.c.headerOffset;
	},

	/**
	 * Set footer offset
	 *
	 * @param  {int} new value for footerOffset
	 */
	footerOffset: function (offset) {
		if (offset !== undefined) {
			this.c.footerOffset = offset;
			this.update();
		}

		return this.c.footerOffset;
	},

	/**
	 * Recalculate the position of the fixed elements and force them into place
	 */
	update: function (force) {
		var table = this.s.dt.table().node();

		// Update should only do something if enabled by the dev.
		if (!this.s.enable && !this.s.autoDisable) {
			return;
		}

		if ($(table).is(':visible')) {
			this.s.autoDisable = false;
			this.enable(true, false);
		}
		else {
			this.s.autoDisable = true;
			this.enable(false, false);
		}

		// Don't update if header is not in the document atm (due to
		// async events)
		if ($(table).children('thead').length === 0) {
			return;
		}

		this._positions();
		this._scroll(force !== undefined ? force : true);
		this._widths(this.dom.header);
		this._widths(this.dom.footer);
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * FixedHeader constructor - adding the required event listeners and
	 * simple initialisation
	 *
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;

		$(window)
			.on('scroll' + this.s.namespace, function () {
				that._scroll();
			})
			.on(
				'resize' + this.s.namespace,
				DataTable.util.throttle(function () {
					that.s.position.windowHeight = $(window).height();
					that.update();
				}, 50)
			);

		var autoHeader = $('.fh-fixedHeader');
		if (!this.c.headerOffset && autoHeader.length) {
			this.c.headerOffset = autoHeader.outerHeight();
		}

		var autoFooter = $('.fh-fixedFooter');
		if (!this.c.footerOffset && autoFooter.length) {
			this.c.footerOffset = autoFooter.outerHeight();
		}

		dt.on(
			'column-reorder.dt.dtfc column-visibility.dt.dtfc column-sizing.dt.dtfc responsive-display.dt.dtfc',
			function (e, ctx) {
				that.update();
			}
		).on('draw.dt.dtfc', function (e, ctx) {
			// For updates from our own table, don't reclone, but for all others, do
			that.update(ctx === dt.settings()[0] ? false : true);
		});

		dt.on('destroy.dtfc', function () {
			that.destroy();
		});

		this._positions();
		this._scroll();
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Clone a fixed item to act as a place holder for the original element
	 * which is moved into a clone of the table element, and moved around the
	 * document to give the fixed effect.
	 *
	 * @param  {string}  item  'header' or 'footer'
	 * @param  {boolean} force Force the clone to happen, or allow automatic
	 *   decision (reuse existing if available)
	 * @private
	 */
	_clone: function (item, force) {
		var that = this;
		var dt = this.s.dt;
		var itemDom = this.dom[item];
		var itemElement = item === 'header' ? this.dom.thead : this.dom.tfoot;

		// If footer and scrolling is enabled then we don't clone
		// Instead the table's height is decreased accordingly - see `_scroll()`
		if (item === 'footer' && this._scrollEnabled()) {
			return;
		}

		if (!force && itemDom.floating) {
			// existing floating element - reuse it
			itemDom.floating.removeClass(
				'fixedHeader-floating fixedHeader-locked'
			);
		}
		else {
			if (itemDom.floating) {
				if (itemDom.placeholder !== null) {
					itemDom.placeholder.remove();
				}

				itemDom.floating.children().detach();
				itemDom.floating.remove();
			}

			var tableNode = $(dt.table().node());
			var scrollBody = $(tableNode.parent());
			var scrollEnabled = this._scrollEnabled();

			itemDom.floating = $(dt.table().node().cloneNode(false))
				.attr('aria-hidden', 'true')
				.css({
					top: 0,
					left: 0
				})
				.removeAttr('id');

			itemDom.floatingParent
				.css({
					width: scrollBody[0].offsetWidth,
					overflow: 'hidden',
					height: 'fit-content',
					position: 'fixed',
					left: scrollEnabled
						? tableNode.offset().left + scrollBody.scrollLeft()
						: 0
				})
				.css(
					item === 'header'
						? {
								top: this.c.headerOffset,
								bottom: ''
						}
						: {
								top: '',
								bottom: this.c.footerOffset
						}
				)
				.addClass(
					item === 'footer'
						? 'dtfh-floatingparent-foot'
						: 'dtfh-floatingparent-head'
				)
				.appendTo('body')
				.children()
				.eq(0)
				.append(itemDom.floating);

			this._stickyPosition(itemDom.floating, '-');

			var scrollLeftUpdate = function () {
				var scrollLeft = scrollBody.scrollLeft();
				that.s.scrollLeft = { footer: scrollLeft, header: scrollLeft };
				itemDom.floatingParent.scrollLeft(that.s.scrollLeft.header);
			};

			scrollLeftUpdate();
			scrollBody.off('scroll.dtfh').on('scroll.dtfh', scrollLeftUpdate);

			// Need padding on the header's container to allow for a scrollbar,
			// just like how DataTables handles it
			itemDom.floatingParent.children().css({
				width: 'fit-content',
				paddingRight: that.s.dt.settings()[0].oBrowser.barWidth
			});

			// Blocker to hide the table behind the scrollbar - this needs to use
			// fixed positioning in the container since we don't have an outer wrapper
			let blocker = $(
				item === 'footer'
					? 'div.dtfc-bottom-blocker'
					: 'div.dtfc-top-blocker',
				dt.table().container()
			);

			if (blocker.length) {
				blocker
					.clone()
					.appendTo(itemDom.floatingParent)
					.css({
						position: 'fixed',
						right: blocker.width()
					});
			}

			// Insert a fake thead/tfoot into the DataTable to stop it jumping around
			itemDom.placeholder = itemElement.clone(false);
			itemDom.placeholder.find('*[id]').removeAttr('id');

			// Move the thead / tfoot elements around - original into the floating
			// element and clone into the original table
			itemDom.host.prepend(itemDom.placeholder);
			itemDom.floating.append(itemElement);

			this._widths(itemDom);
		}
	},

	/**
	 * This method sets the sticky position of the header elements to match fixed columns
	 * @param {JQuery<HTMLElement>} el
	 * @param {string} sign
	 */
	_stickyPosition: function (el, sign) {
		if (this._scrollEnabled()) {
			var that = this;
			var rtl = $(that.s.dt.table().node()).css('direction') === 'rtl';

			el.find('th').each(function () {
				// Find out if fixed header has previously set this column
				if ($(this).css('position') === 'sticky') {
					var right = $(this).css('right');
					var left = $(this).css('left');
					var potential;

					if (right !== 'auto' && !rtl) {
						potential = +right.replace(/px/g, '')

						$(this).css('right', potential > 0 ? potential : 0);
					}
					else if (left !== 'auto' && rtl) {
						potential = +left.replace(/px/g, '');

						$(this).css('left', potential > 0 ? potential : 0);
					}
				}
			});
		}
	},

	/**
	 * Reposition the floating elements to take account of horizontal page
	 * scroll
	 *
	 * @param  {string} item       The `header` or `footer`
	 * @param  {int}    scrollLeft Document scrollLeft
	 * @private
	 */
	_horizontal: function (item, scrollLeft) {
		var itemDom = this.dom[item];
		var lastScrollLeft = this.s.scrollLeft;

		if (itemDom.floating && lastScrollLeft[item] !== scrollLeft) {
			// If scrolling is enabled we need to match the floating header to the body
			if (this._scrollEnabled()) {
				var newScrollLeft = $(
					$(this.s.dt.table().node()).parent()
				).scrollLeft();
				itemDom.floating.scrollLeft(newScrollLeft);
				itemDom.floatingParent.scrollLeft(newScrollLeft);
			}

			lastScrollLeft[item] = scrollLeft;
		}
	},

	/**
	 * Change from one display mode to another. Each fixed item can be in one
	 * of:
	 *
	 * * `in-place` - In the main DataTable
	 * * `in` - Floating over the DataTable
	 * * `below` - (Header only) Fixed to the bottom of the table body
	 * * `above` - (Footer only) Fixed to the top of the table body
	 *
	 * @param  {string}  mode        Mode that the item should be shown in
	 * @param  {string}  item        'header' or 'footer'
	 * @param  {boolean} forceChange Force a redraw of the mode, even if already
	 *     in that mode.
	 * @private
	 */
	_modeChange: function (mode, item, forceChange) {
		var itemDom = this.dom[item];
		var position = this.s.position;

		// Just determine if scroll is enabled once
		var scrollEnabled = this._scrollEnabled();

		// If footer and scrolling is enabled then we don't clone
		// Instead the table's height is decreased accordingly - see `_scroll()`
		if (item === 'footer' && scrollEnabled) {
			return;
		}

		// It isn't trivial to add a !important css attribute...
		var importantWidth = function (w) {
			itemDom.floating[0].style.setProperty('width', w + 'px', 'important');

			// If not scrolling also have to update the floatingParent
			if (!scrollEnabled) {
				itemDom.floatingParent[0].style.setProperty('width', w + 'px', 'important');
			}
		};

		// Record focus. Browser's will cause input elements to loose focus if
		// they are inserted else where in the doc
		var tablePart = this.dom[item === 'footer' ? 'tfoot' : 'thead'];
		var focus = $.contains(tablePart[0], document.activeElement)
			? document.activeElement
			: null;
		var scrollBody = $($(this.s.dt.table().node()).parent());

		if (mode === 'in-place') {
			// Insert the header back into the table's real header
			if (itemDom.placeholder) {
				itemDom.placeholder.remove();
				itemDom.placeholder = null;
			}

			if (item === 'header') {
				itemDom.host.prepend(tablePart);
			}
			else {
				itemDom.host.append(tablePart);
			}

			if (itemDom.floating) {
				itemDom.floating.remove();
				itemDom.floating = null;
				this._stickyPosition(itemDom.host, '+');
			}

			if (itemDom.floatingParent) {
				itemDom.floatingParent.find('div.dtfc-top-blocker').remove();
				itemDom.floatingParent.remove();
			}

			$($(itemDom.host.parent()).parent()).scrollLeft(
				scrollBody.scrollLeft()
			);
		}
		else if (mode === 'in') {
			// Remove the header from the real table and insert into a fixed
			// positioned floating table clone
			this._clone(item, forceChange);

			// Get useful position values
			var scrollOffset = scrollBody.offset();
			var windowTop = $(document).scrollTop();
			var windowHeight = $(window).height();
			var windowBottom = windowTop + windowHeight;
			var bodyTop = scrollEnabled ? scrollOffset.top : position.tbodyTop;
			var bodyBottom = scrollEnabled
				? scrollOffset.top + scrollBody.outerHeight()
				: position.tfootTop;

			// Calculate the amount that the footer or header needs to be shuffled
			var shuffle;

			if (item === 'footer') {
				shuffle =
					bodyTop > windowBottom
						? position.tfootHeight // Yes - push the footer below
						: bodyTop + position.tfootHeight - windowBottom; // No
			}
			else {
				// Otherwise must be a header so get the difference from the bottom of the
				//  desired floating header and the bottom of the table body
				shuffle =
					windowTop +
					this.c.headerOffset +
					position.theadHeight -
					bodyBottom;
			}

			// Set the top or bottom based off of the offset and the shuffle value
			var prop = item === 'header' ? 'top' : 'bottom';
			var val = this.c[item + 'Offset'] - (shuffle > 0 ? shuffle : 0);

			itemDom.floating.addClass('fixedHeader-floating');
			itemDom.floatingParent
				.css(prop, val)
				.css({
					left: position.left,
					'z-index': 3
				});

			importantWidth(position.width);

			if (item === 'footer') {
				itemDom.floating.css('top', '');
			}
		}
		else if (mode === 'below') {
			// only used for the header
			// Fix the position of the floating header at base of the table body
			this._clone(item, forceChange);

			itemDom.floating.addClass('fixedHeader-locked');
			itemDom.floatingParent.css({
				position: 'absolute',
				top: position.tfootTop - position.theadHeight,
				left: position.left + 'px'
			});

			importantWidth(position.width);
		}
		else if (mode === 'above') {
			// only used for the footer
			// Fix the position of the floating footer at top of the table body
			this._clone(item, forceChange);

			itemDom.floating.addClass('fixedHeader-locked');
			itemDom.floatingParent.css({
				position: 'absolute',
				top: position.tbodyTop,
				left: position.left + 'px'
			});

			importantWidth(position.width);
		}

		// Restore focus if it was lost
		if (focus && focus !== document.activeElement) {
			setTimeout(function () {
				focus.focus();
			}, 10);
		}

		this.s.scrollLeft.header = -1;
		this.s.scrollLeft.footer = -1;
		this.s[item + 'Mode'] = mode;
	},

	/**
	 * Cache the positional information that is required for the mode
	 * calculations that FixedHeader performs.
	 *
	 * @private
	 */
	_positions: function () {
		var dt = this.s.dt;
		var table = dt.table();
		var position = this.s.position;
		var dom = this.dom;
		var tableNode = $(table.node());
		var scrollEnabled = this._scrollEnabled();

		// Need to use the header and footer that are in the main table,
		// regardless of if they are clones, since they hold the positions we
		// want to measure from
		var thead = $(dt.table().header());
		var tfoot = $(dt.table().footer());
		var tbody = dom.tbody;
		var scrollBody = tableNode.parent();

		position.visible = tableNode.is(':visible');
		position.width = tableNode.outerWidth();
		position.left = tableNode.offset().left;
		position.theadTop = thead.offset().top;
		position.tbodyTop = scrollEnabled
			? scrollBody.offset().top
			: tbody.offset().top;
		position.tbodyHeight = scrollEnabled
			? scrollBody.outerHeight()
			: tbody.outerHeight();
		position.theadHeight = thead.outerHeight();
		position.theadBottom = position.theadTop + position.theadHeight;
		position.tfootTop = position.tbodyTop + position.tbodyHeight; //tfoot.offset().top;

		if (tfoot.length) {
			position.tfootBottom = position.tfootTop + tfoot.outerHeight();
			position.tfootHeight = tfoot.outerHeight();
		}
		else {
			position.tfootBottom = position.tfootTop;
			position.tfootHeight = 0;
		}
	},

	/**
	 * Mode calculation - determine what mode the fixed items should be placed
	 * into.
	 *
	 * @param  {boolean} forceChange Force a redraw of the mode, even if already
	 *     in that mode.
	 * @private
	 */
	_scroll: function (forceChange) {
		if (this.s.dt.settings()[0].bDestroying) {
			return;
		}

		// ScrollBody details
		var scrollEnabled = this._scrollEnabled();
		var scrollBody = $(this.s.dt.table().node()).parent();
		var scrollOffset = scrollBody.offset();
		var scrollHeight = scrollBody.outerHeight();

		// Window details
		var windowLeft = $(document).scrollLeft();
		var windowTop = $(document).scrollTop();
		var windowHeight = $(window).height();
		var windowBottom = windowHeight + windowTop;

		var position = this.s.position;
		var headerMode, footerMode;

		// Body Details
		var bodyTop = scrollEnabled ? scrollOffset.top : position.tbodyTop;
		var bodyLeft = scrollEnabled ? scrollOffset.left : position.left;
		var bodyBottom = scrollEnabled
			? scrollOffset.top + scrollHeight
			: position.tfootTop;
		var bodyWidth = scrollEnabled
			? scrollBody.outerWidth()
			: position.tbodyWidth;

		if (this.c.header) {
			if (!this.s.enable) {
				headerMode = 'in-place';
			}
			// The header is in it's normal place if the body top is lower than
			//  the scroll of the window plus the headerOffset and the height of the header
			else if (
				!position.visible ||
				windowTop + this.c.headerOffset + position.theadHeight <=
					bodyTop
			) {
				headerMode = 'in-place';
			}
			// The header should be floated if
			else if (
				// The scrolling plus the header offset plus the height of the header is lower than the top of the body
				windowTop + this.c.headerOffset + position.theadHeight >
					bodyTop &&
				// And the scrolling at the top plus the header offset is above the bottom of the body
				windowTop + this.c.headerOffset + position.theadHeight <
					bodyBottom
			) {
				headerMode = 'in';

				// Further to the above, If the scrolling plus the header offset plus the header height is lower
				// than the bottom of the table a shuffle is required so have to force the calculation
				if (
					windowTop + this.c.headerOffset + position.theadHeight >
						bodyBottom ||
					this.dom.header.floatingParent === undefined
				) {
					forceChange = true;
				}
				else {
					this.dom.header.floatingParent
						.css({
							top: this.c.headerOffset,
							position: 'fixed'
						})
						.children()
						.eq(0)
						.append(this.dom.header.floating);
				}
			}
			// Anything else and the view is below the table
			else {
				headerMode = 'below';
			}

			if (forceChange || headerMode !== this.s.headerMode) {
				this._modeChange(headerMode, 'header', forceChange);
			}

			this._horizontal('header', windowLeft);
		}

		var header = {
			offset: { top: 0, left: 0 },
			height: 0
		};
		var footer = {
			offset: { top: 0, left: 0 },
			height: 0
		};

		if (
			this.c.footer &&
			this.dom.tfoot.length &&
			this.dom.tfoot.find('th, td').length
		) {
			if (!this.s.enable) {
				footerMode = 'in-place';
			}
			else if (
				!position.visible ||
				position.tfootBottom + this.c.footerOffset <= windowBottom
			) {
				footerMode = 'in-place';
			}
			else if (
				bodyBottom + position.tfootHeight + this.c.footerOffset >
					windowBottom &&
				bodyTop + this.c.footerOffset < windowBottom
			) {
				footerMode = 'in';
				forceChange = true;
			}
			else {
				footerMode = 'above';
			}

			if (forceChange || footerMode !== this.s.footerMode) {
				this._modeChange(footerMode, 'footer', forceChange);
			}

			this._horizontal('footer', windowLeft);

			var getOffsetHeight = function (el) {
				return {
					offset: el.offset(),
					height: el.outerHeight()
				};
			};

			header = this.dom.header.floating
				? getOffsetHeight(this.dom.header.floating)
				: getOffsetHeight(this.dom.thead);
			footer = this.dom.footer.floating
				? getOffsetHeight(this.dom.footer.floating)
				: getOffsetHeight(this.dom.tfoot);

			// If scrolling is enabled and the footer is off the screen
			if (scrollEnabled && footer.offset.top > windowTop) {
				// && footer.offset.top >= windowBottom) {
				// Calculate the gap between the top of the scrollBody and the top of the window
				var overlap = windowTop - scrollOffset.top;
				// The new height is the bottom of the window
				var newHeight =
					windowBottom +
					// If the gap between the top of the scrollbody and the window is more than
					//  the height of the header then the top of the table is still visible so add that gap
					// Doing this has effectively calculated the height from the top of the table to the bottom of the current page
					(overlap > -header.height ? overlap : 0) -
					// Take from that
					// The top of the header plus
					(header.offset.top +
						// The header height if the standard header is present
						(overlap < -header.height ? header.height : 0) +
						// And the height of the footer
						footer.height);

				// Don't want a negative height
				if (newHeight < 0) {
					newHeight = 0;
				}

				// At the end of the above calculation the space between the header (top of the page if floating)
				// and the point just above the footer should be the new value for the height of the table.
				scrollBody.outerHeight(newHeight);

				// Need some rounding here as sometimes very small decimal places are encountered
				// If the actual height is bigger or equal to the height we just applied then the footer is "Floating"
				if (
					Math.round(scrollBody.outerHeight()) >=
					Math.round(newHeight)
				) {
					$(this.dom.tfoot.parent()).addClass('fixedHeader-floating');
				}
				// Otherwise max-width has kicked in so it is not floating
				else {
					$(this.dom.tfoot.parent()).removeClass(
						'fixedHeader-floating'
					);
				}
			}
		}

		if (this.dom.header.floating) {
			this.dom.header.floatingParent.css('left', bodyLeft - windowLeft);
		}
		if (this.dom.footer.floating) {
			this.dom.footer.floatingParent.css('left', bodyLeft - windowLeft);
		}

		// If fixed columns is being used on this table then the blockers need to be copied across
		// Cloning these is cleaner than creating as our own as it will keep consistency with fixedColumns automatically
		// ASSUMING that the class remains the same
		if (this.s.dt.settings()[0]._fixedColumns !== undefined) {
			var adjustBlocker = function (side, end, el) {
				if (el === undefined) {
					var blocker = $(
						'div.dtfc-' + side + '-' + end + '-blocker'
					);

					el =
						blocker.length === 0
							? null
							: blocker.clone().css('z-index', 1);
				}

				if (el !== null) {
					if (headerMode === 'in' || headerMode === 'below') {
						el.appendTo('body').css({
							top:
								end === 'top'
									? header.offset.top
									: footer.offset.top,
							left:
								side === 'right'
									? bodyLeft + bodyWidth - el.width()
									: bodyLeft
						});
					}
					else {
						el.detach();
					}
				}

				return el;
			};

			// Adjust all blockers
			this.dom.header.rightBlocker = adjustBlocker(
				'right',
				'top',
				this.dom.header.rightBlocker
			);
			this.dom.header.leftBlocker = adjustBlocker(
				'left',
				'top',
				this.dom.header.leftBlocker
			);
			this.dom.footer.rightBlocker = adjustBlocker(
				'right',
				'bottom',
				this.dom.footer.rightBlocker
			);
			this.dom.footer.leftBlocker = adjustBlocker(
				'left',
				'bottom',
				this.dom.footer.leftBlocker
			);
		}
	},

	/**
	 * Function to check if scrolling is enabled on the table or not
	 * @returns Boolean value indicating if scrolling on the table is enabled or not
	 */
	_scrollEnabled: function () {
		var oScroll = this.s.dt.settings()[0].oScroll;
		if (oScroll.sY !== '' || oScroll.sX !== '') {
			return true;
		}
		return false;
	},

	/**
	 * Realign columns by using the colgroup tag and
	 * checking column widths
	 */
	_widths: function (itemDom) {
		if (! itemDom || ! itemDom.placeholder) {
			return;
		}

		// Match the table overall width
		var tableNode = $(this.s.dt.table().node());
		var scrollBody = $(tableNode.parent());

		itemDom.floatingParent.css('width', scrollBody[0].offsetWidth);
		itemDom.floating.css('width', tableNode[0].offsetWidth);

		// Strip out the old colgroup
		$('colgroup', itemDom.floating).remove();

		// Copy the `colgroup` element to define the number of columns - needed
		// for complex header cases where a column might not have a unique
		// header
		var cols = itemDom.placeholder
			.parent()
			.find('colgroup')
			.clone()
			.appendTo(itemDom.floating)
			.find('col');

		// However, the widths defined in the colgroup from the DataTable might
		// not exactly reflect the actual widths of the columns (content can
		// force it to stretch). So we need to copy the actual widths into the
		// colgroup / col's used for the floating header.
		var widths = this.s.dt.columns(':visible').widths();

		for (var i=0 ; i<widths.length ; i++) {
			cols.eq(i).css('width', widths[i]);
		}
	}
});

/**
 * Version
 * @type {String}
 * @static
 */
FixedHeader.version = '4.0.1';

/**
 * Defaults
 * @type {Object}
 * @static
 */
FixedHeader.defaults = {
	header: true,
	footer: false,
	headerOffset: 0,
	footerOffset: 0
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interfaces
 */

// Attach for constructor access
$.fn.dataTable.FixedHeader = FixedHeader;
$.fn.DataTable.FixedHeader = FixedHeader;

// DataTables creation - check if the FixedHeader option has been defined on the
// table and if so, initialise
$(document).on('init.dt.dtfh', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.oInit.fixedHeader;
	var defaults = DataTable.defaults.fixedHeader;

	if ((init || defaults) && !settings._fixedHeader) {
		var opts = $.extend({}, defaults, init);

		if (init !== false) {
			new FixedHeader(settings, opts);
		}
	}
});

// DataTables API methods
DataTable.Api.register('fixedHeader()', function () { });

DataTable.Api.register('fixedHeader.adjust()', function () {
	return this.iterator('table', function (ctx) {
		var fh = ctx._fixedHeader;

		if (fh) {
			fh.update();
		}
	});
});

DataTable.Api.register('fixedHeader.enable()', function (flag) {
	return this.iterator('table', function (ctx) {
		var fh = ctx._fixedHeader;

		flag = flag !== undefined ? flag : true;
		if (fh && flag !== fh.enabled()) {
			fh.enable(flag);
		}
	});
});

DataTable.Api.register('fixedHeader.enabled()', function () {
	if (this.context.length) {
		var fh = this.context[0]._fixedHeader;

		if (fh) {
			return fh.enabled();
		}
	}

	return false;
});

DataTable.Api.register('fixedHeader.disable()', function () {
	return this.iterator('table', function (ctx) {
		var fh = ctx._fixedHeader;

		if (fh && fh.enabled()) {
			fh.enable(false);
		}
	});
});

$.each(['header', 'footer'], function (i, el) {
	DataTable.Api.register('fixedHeader.' + el + 'Offset()', function (offset) {
		var ctx = this.context;

		if (offset === undefined) {
			return ctx.length && ctx[0]._fixedHeader
				? ctx[0]._fixedHeader[el + 'Offset']()
				: undefined;
		}

		return this.iterator('table', function (ctx) {
			var fh = ctx._fixedHeader;

			if (fh) {
				fh[el + 'Offset'](offset);
			}
		});
	});
});


return DataTable;
}));


/*! Responsive 3.0.4
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     Responsive
 * @description Responsive tables plug-in for DataTables
 * @version     3.0.4
 * @author      SpryMedia Ltd
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/**
 * Responsive is a plug-in for the DataTables library that makes use of
 * DataTables' ability to change the visibility of columns, changing the
 * visibility of columns so the displayed columns fit into the table container.
 * The end result is that complex tables will be dynamically adjusted to fit
 * into the viewport, be it on a desktop, tablet or mobile browser.
 *
 * Responsive for DataTables has two modes of operation, which can used
 * individually or combined:
 *
 * * Class name based control - columns assigned class names that match the
 *   breakpoint logic can be shown / hidden as required for each breakpoint.
 * * Automatic control - columns are automatically hidden when there is no
 *   room left to display them. Columns removed from the right.
 *
 * In additional to column visibility control, Responsive also has built into
 * options to use DataTables' child row display to show / hide the information
 * from the table that has been hidden. There are also two modes of operation
 * for this child row display:
 *
 * * Inline - when the control element that the user can use to show / hide
 *   child rows is displayed inside the first column of the table.
 * * Column - where a whole column is dedicated to be the show / hide control.
 *
 * Initialisation of Responsive is performed by:
 *
 * * Adding the class `responsive` or `dt-responsive` to the table. In this case
 *   Responsive will automatically be initialised with the default configuration
 *   options when the DataTable is created.
 * * Using the `responsive` option in the DataTables configuration options. This
 *   can also be used to specify the configuration options, or simply set to
 *   `true` to use the defaults.
 *
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 2.0.0+
 *
 *  @example
 *      $('#example').DataTable( {
 *        responsive: true
 *      } );
 *    } );
 */
var Responsive = function (settings, opts) {
	// Sanity check that we are using DataTables 2.0.0 or newer
	if (!DataTable.versionCheck || !DataTable.versionCheck('2')) {
		throw 'DataTables Responsive requires DataTables 2 or newer';
	}

	this.s = {
		childNodeStore: {},
		columns: [],
		current: [],
		dt: new DataTable.Api(settings)
	};

	// Check if responsive has already been initialised on this table
	if (this.s.dt.settings()[0].responsive) {
		return;
	}

	// details is an object, but for simplicity the user can give it as a string
	// or a boolean
	if (opts && typeof opts.details === 'string') {
		opts.details = { type: opts.details };
	}
	else if (opts && opts.details === false) {
		opts.details = { type: false };
	}
	else if (opts && opts.details === true) {
		opts.details = { type: 'inline' };
	}

	this.c = $.extend(
		true,
		{},
		Responsive.defaults,
		DataTable.defaults.responsive,
		opts
	);
	settings.responsive = this;
	this._constructor();
};

$.extend(Responsive.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the Responsive instance
	 *
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var oldWindowWidth = $(window).innerWidth();

		dt.settings()[0]._responsive = this;

		// Use DataTables' throttle function to avoid processor thrashing
		$(window).on(
			'orientationchange.dtr',
			DataTable.util.throttle(function () {
				// iOS has a bug whereby resize can fire when only scrolling
				// See: http://stackoverflow.com/questions/8898412
				var width = $(window).innerWidth();

				if (width !== oldWindowWidth) {
					that._resize();
					oldWindowWidth = width;
				}
			})
		);

		// Handle new rows being dynamically added - needed as responsive
		// updates all rows (shown or not) a responsive change, rather than
		// per draw.
		dt.on('row-created.dtr', function (e, tr, data, idx) {
			if ($.inArray(false, that.s.current) !== -1) {
				$('>td, >th', tr).each(function (i) {
					var idx = dt.column.index('toData', i);

					if (that.s.current[idx] === false) {
						$(this)
							.css('display', 'none')
							.addClass('dtr-hidden');
					}
				});
			}
		});

		// Destroy event handler
		dt.on('destroy.dtr', function () {
			dt.off('.dtr');
			$(dt.table().body()).off('.dtr');
			$(window).off('resize.dtr orientationchange.dtr');
			dt.cells('.dtr-control').nodes().to$().removeClass('dtr-control');
			$(dt.table().node()).removeClass('dtr-inline collapsed');

			// Restore the columns that we've hidden
			$.each(that.s.current, function (i, val) {
				if (val === false) {
					that._setColumnVis(i, true);
				}
			});
		});

		// Reorder the breakpoints array here in case they have been added out
		// of order
		this.c.breakpoints.sort(function (a, b) {
			return a.width < b.width ? 1 : a.width > b.width ? -1 : 0;
		});

		this._classLogic();

		// Details handler
		var details = this.c.details;

		if (details.type !== false) {
			that._detailsInit();

			// DataTables will trigger this event on every column it shows and
			// hides individually
			dt.on('column-visibility.dtr', function () {
				// Use a small debounce to allow multiple columns to be set together
				if (that._timer) {
					clearTimeout(that._timer);
				}

				that._timer = setTimeout(function () {
					that._timer = null;

					that._classLogic();
					that._resizeAuto();
					that._resize(true);

					that._redrawChildren();
				}, 100);
			});

			// Redraw the details box on each draw which will happen if the data
			// has changed. This is used until DataTables implements a native
			// `updated` event for rows
			dt.on('draw.dtr', function () {
				that._redrawChildren();
			});

			$(dt.table().node()).addClass('dtr-' + details.type);
		}

		// DT2 let's us tell it if we are hiding columns
		dt.on('column-calc.dt', function (e, d) {
			var curr = that.s.current;

			for (var i = 0; i < curr.length; i++) {
				var idx = d.visible.indexOf(i);

				if (curr[i] === false && idx >= 0) {
					d.visible.splice(idx, 1);
				}
			}
		});

		// On Ajax reload we want to reopen any child rows which are displayed
		// by responsive
		dt.on('preXhr.dtr', function () {
			var rowIds = [];
			dt.rows().every(function () {
				if (this.child.isShown()) {
					rowIds.push(this.id(true));
				}
			});

			dt.one('draw.dtr', function () {
				that._resizeAuto();
				that._resize();

				dt.rows(rowIds).every(function () {
					that._detailsDisplay(this, false);
				});
			});
		});

		// First pass when the table is ready
		dt
			.on('draw.dtr', function () {
				that._controlClass();
			})
			.ready(function () {
				that._resizeAuto();
				that._resize();

				// Attach listeners after first pass
				dt.on('column-reorder.dtr', function (e, settings, details) {
					that._classLogic();
					that._resizeAuto();
					that._resize(true);
				});

				// Change in column sizes means we need to calc
				dt.on('column-sizing.dtr', function () {
					that._resizeAuto();
					that._resize();
				});
			});
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Insert a `col` tag into the correct location in a `colgroup`.
	 *
	 * @param {jQuery} colGroup The `colgroup` tag
	 * @param {jQuery} colEl The `col` tag
	 */
	_colGroupAttach: function (colGroup, colEls, idx) {
		var found = null;

		// No need to do anything if already attached
		if (colEls[idx].get(0).parentNode === colGroup[0]) {
			return;
		}

		// Find the first `col` after our own which is already attached
		for (var i = idx+1; i < colEls.length; i++) {
			if (colGroup[0] === colEls[i].get(0).parentNode) {
				found = i;
				break;
			}
		}

		if (found !== null) {
			// Insert before
			colEls[idx].insertBefore(colEls[found][0]);
		}
		else {
			// If wasn't found, insert at the end
			colGroup.append(colEls[idx]);
		}
	},

	/**
	 * Get and store nodes from a cell - use for node moving renderers
	 *
	 * @param {*} dt DT instance
	 * @param {*} row Row index
	 * @param {*} col Column index
	 */
	_childNodes: function (dt, row, col) {
		var name = row + '-' + col;

		if (this.s.childNodeStore[name]) {
			return this.s.childNodeStore[name];
		}

		// https://jsperf.com/childnodes-array-slice-vs-loop
		var nodes = [];
		var children = dt.cell(row, col).node().childNodes;
		for (var i = 0, ien = children.length; i < ien; i++) {
			nodes.push(children[i]);
		}

		this.s.childNodeStore[name] = nodes;

		return nodes;
	},

	/**
	 * Restore nodes from the cache to a table cell
	 *
	 * @param {*} dt DT instance
	 * @param {*} row Row index
	 * @param {*} col Column index
	 */
	_childNodesRestore: function (dt, row, col) {
		var name = row + '-' + col;

		if (!this.s.childNodeStore[name]) {
			return;
		}

		var node = dt.cell(row, col).node();
		var store = this.s.childNodeStore[name];
		if (store.length > 0) {
			var parent = store[0].parentNode;
			var parentChildren = parent.childNodes;
			var a = [];

			for (var i = 0, ien = parentChildren.length; i < ien; i++) {
				a.push(parentChildren[i]);
			}

			for (var j = 0, jen = a.length; j < jen; j++) {
				node.appendChild(a[j]);
			}
		}

		this.s.childNodeStore[name] = undefined;
	},

	/**
	 * Calculate the visibility for the columns in a table for a given
	 * breakpoint. The result is pre-determined based on the class logic if
	 * class names are used to control all columns, but the width of the table
	 * is also used if there are columns which are to be automatically shown
	 * and hidden.
	 *
	 * @param  {string} breakpoint Breakpoint name to use for the calculation
	 * @return {array} Array of boolean values initiating the visibility of each
	 *   column.
	 *  @private
	 */
	_columnsVisiblity: function (breakpoint) {
		var dt = this.s.dt;
		var columns = this.s.columns;
		var i, ien;

		// Create an array that defines the column ordering based first on the
		// column's priority, and secondly the column index. This allows the
		// columns to be removed from the right if the priority matches
		var order = columns
			.map(function (col, idx) {
				return {
					columnIdx: idx,
					priority: col.priority
				};
			})
			.sort(function (a, b) {
				if (a.priority !== b.priority) {
					return a.priority - b.priority;
				}
				return a.columnIdx - b.columnIdx;
			});

		// Class logic - determine which columns are in this breakpoint based
		// on the classes. If no class control (i.e. `auto`) then `-` is used
		// to indicate this to the rest of the function
		var display = $.map(columns, function (col, i) {
			if (dt.column(i).visible() === false) {
				return 'not-visible';
			}
			return col.auto && col.minWidth === null
				? false
				: col.auto === true
				? '-'
				: $.inArray(breakpoint, col.includeIn) !== -1;
		});

		// Auto column control - first pass: how much width is taken by the
		// ones that must be included from the non-auto columns
		var requiredWidth = 0;
		for (i = 0, ien = display.length; i < ien; i++) {
			if (display[i] === true) {
				requiredWidth += columns[i].minWidth;
			}
		}

		// Second pass, use up any remaining width for other columns. For
		// scrolling tables we need to subtract the width of the scrollbar. It
		// may not be requires which makes this sub-optimal, but it would
		// require another full redraw to make complete use of those extra few
		// pixels
		var scrolling = dt.settings()[0].oScroll;
		var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
		var widthAvailable = dt.table().container().offsetWidth - bar;
		var usedWidth = widthAvailable - requiredWidth;

		// Control column needs to always be included. This makes it sub-
		// optimal in terms of using the available with, but to stop layout
		// thrashing or overflow. Also we need to account for the control column
		// width first so we know how much width is available for the other
		// columns, since the control column might not be the first one shown
		for (i = 0, ien = display.length; i < ien; i++) {
			if (columns[i].control) {
				usedWidth -= columns[i].minWidth;
			}
		}

		// Allow columns to be shown (counting by priority and then right to
		// left) until we run out of room
		var empty = false;
		for (i = 0, ien = order.length; i < ien; i++) {
			var colIdx = order[i].columnIdx;

			if (
				display[colIdx] === '-' &&
				!columns[colIdx].control &&
				columns[colIdx].minWidth
			) {
				// Once we've found a column that won't fit we don't let any
				// others display either, or columns might disappear in the
				// middle of the table
				if (empty || usedWidth - columns[colIdx].minWidth < 0) {
					empty = true;
					display[colIdx] = false;
				}
				else {
					display[colIdx] = true;
				}

				usedWidth -= columns[colIdx].minWidth;
			}
		}

		// Determine if the 'control' column should be shown (if there is one).
		// This is the case when there is a hidden column (that is not the
		// control column). The two loops look inefficient here, but they are
		// trivial and will fly through. We need to know the outcome from the
		// first , before the action in the second can be taken
		var showControl = false;

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (
				!columns[i].control &&
				!columns[i].never &&
				display[i] === false
			) {
				showControl = true;
				break;
			}
		}

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (columns[i].control) {
				display[i] = showControl;
			}

			// Replace not visible string with false from the control column detection above
			if (display[i] === 'not-visible') {
				display[i] = false;
			}
		}

		// Finally we need to make sure that there is at least one column that
		// is visible
		if ($.inArray(true, display) === -1) {
			display[0] = true;
		}

		return display;
	},

	/**
	 * Create the internal `columns` array with information about the columns
	 * for the table. This includes determining which breakpoints the column
	 * will appear in, based upon class names in the column, which makes up the
	 * vast majority of this method.
	 *
	 * @private
	 */
	_classLogic: function () {
		var that = this;
		var breakpoints = this.c.breakpoints;
		var dt = this.s.dt;
		var columns = dt
			.columns()
			.eq(0)
			.map(function (i) {
				var column = this.column(i);
				var className = column.header().className;
				var priority = column.init().responsivePriority;
				var dataPriority = column
					.header()
					.getAttribute('data-priority');

				if (priority === undefined) {
					priority =
						dataPriority === undefined || dataPriority === null
							? 10000
							: dataPriority * 1;
				}

				return {
					className: className,
					includeIn: [],
					auto: false,
					control: false,
					never: className.match(/\b(dtr\-)?never\b/) ? true : false,
					priority: priority
				};
			});

		// Simply add a breakpoint to `includeIn` array, ensuring that there are
		// no duplicates
		var add = function (colIdx, name) {
			var includeIn = columns[colIdx].includeIn;

			if ($.inArray(name, includeIn) === -1) {
				includeIn.push(name);
			}
		};

		var column = function (colIdx, name, operator, matched) {
			var size, i, ien;

			if (!operator) {
				columns[colIdx].includeIn.push(name);
			}
			else if (operator === 'max-') {
				// Add this breakpoint and all smaller
				size = that._find(name).width;

				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].width <= size) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
			else if (operator === 'min-') {
				// Add this breakpoint and all larger
				size = that._find(name).width;

				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].width >= size) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
			else if (operator === 'not-') {
				// Add all but this breakpoint
				for (i = 0, ien = breakpoints.length; i < ien; i++) {
					if (breakpoints[i].name.indexOf(matched) === -1) {
						add(colIdx, breakpoints[i].name);
					}
				}
			}
		};

		// Loop over each column and determine if it has a responsive control
		// class
		columns.each(function (col, i) {
			var classNames = col.className.split(' ');
			var hasClass = false;

			// Split the class name up so multiple rules can be applied if needed
			for (var k = 0, ken = classNames.length; k < ken; k++) {
				var className = classNames[k].trim();

				if (className === 'all' || className === 'dtr-all') {
					// Include in all
					hasClass = true;
					col.includeIn = $.map(breakpoints, function (a) {
						return a.name;
					});
					return;
				}
				else if (
					className === 'none' ||
					className === 'dtr-none' ||
					col.never
				) {
					// Include in none (default) and no auto
					hasClass = true;
					return;
				}
				else if (
					className === 'control' ||
					className === 'dtr-control'
				) {
					// Special column that is only visible, when one of the other
					// columns is hidden. This is used for the details control
					hasClass = true;
					col.control = true;
					return;
				}

				$.each(breakpoints, function (j, breakpoint) {
					// Does this column have a class that matches this breakpoint?
					var brokenPoint = breakpoint.name.split('-');
					var re = new RegExp(
						'(min\\-|max\\-|not\\-)?(' +
							brokenPoint[0] +
							')(\\-[_a-zA-Z0-9])?'
					);
					var match = className.match(re);

					if (match) {
						hasClass = true;

						if (
							match[2] === brokenPoint[0] &&
							match[3] === '-' + brokenPoint[1]
						) {
							// Class name matches breakpoint name fully
							column(
								i,
								breakpoint.name,
								match[1],
								match[2] + match[3]
							);
						}
						else if (match[2] === brokenPoint[0] && !match[3]) {
							// Class name matched primary breakpoint name with no qualifier
							column(i, breakpoint.name, match[1], match[2]);
						}
					}
				});
			}

			// If there was no control class, then automatic sizing is used
			if (!hasClass) {
				col.auto = true;
			}
		});

		this.s.columns = columns;
	},

	/**
	 * Update the cells to show the correct control class / button
	 * @private
	 */
	_controlClass: function () {
		if (this.c.details.type === 'inline') {
			var dt = this.s.dt;
			var columnsVis = this.s.current;
			var firstVisible = $.inArray(true, columnsVis);

			// Remove from any cells which shouldn't have it
			dt.cells(
				null,
				function (idx) {
					return idx !== firstVisible;
				},
				{ page: 'current' }
			)
				.nodes()
				.to$()
				.filter('.dtr-control')
				.removeClass('dtr-control');

			if (firstVisible >= 0) {
				dt.cells(null, firstVisible, { page: 'current' })
					.nodes()
					.to$()
					.addClass('dtr-control');
			}
		}

		this._tabIndexes();
	},

	/**
	 * Show the details for the child row
	 *
	 * @param  {DataTables.Api} row    API instance for the row
	 * @param  {boolean}        update Update flag
	 * @private
	 */
	_detailsDisplay: function (row, update) {
		var that = this;
		var dt = this.s.dt;
		var details = this.c.details;
		var event = function (res) {
			$(row.node()).toggleClass('dtr-expanded', res !== false);
			$(dt.table().node()).triggerHandler('responsive-display.dt', [
				dt,
				row,
				res,
				update
			]);
		};

		if (details && details.type !== false) {
			var renderer =
				typeof details.renderer === 'string'
					? Responsive.renderer[details.renderer]()
					: details.renderer;

			var res = details.display(
				row,
				update,
				function () {
					return renderer.call(
						that,
						dt,
						row[0][0],
						that._detailsObj(row[0])
					);
				},
				function () {
					event(false);
				}
			);

			if (typeof res === 'boolean') {
				event(res);
			}
		}
	},

	/**
	 * Initialisation for the details handler
	 *
	 * @private
	 */
	_detailsInit: function () {
		var that = this;
		var dt = this.s.dt;
		var details = this.c.details;

		// The inline type always uses the first child as the target
		if (details.type === 'inline') {
			details.target = 'td.dtr-control, th.dtr-control';
		}

		$(dt.table().body()).on('keyup.dtr', 'td, th', function (e) {
			if (e.keyCode === 13 && $(this).data('dtr-keyboard')) {
				$(this).click();
			}
		});

		// type.target can be a string jQuery selector or a column index
		var target = details.target;
		var selector = typeof target === 'string' ? target : 'td, th';

		if (target !== undefined || target !== null) {
			// Click handler to show / hide the details rows when they are available
			$(dt.table().body()).on(
				'click.dtr mousedown.dtr mouseup.dtr',
				selector,
				function (e) {
					// If the table is not collapsed (i.e. there is no hidden columns)
					// then take no action
					if (!$(dt.table().node()).hasClass('collapsed')) {
						return;
					}

					// Check that the row is actually a DataTable's controlled node
					if (
						$.inArray(
							$(this).closest('tr').get(0),
							dt.rows().nodes().toArray()
						) === -1
					) {
						return;
					}

					// For column index, we determine if we should act or not in the
					// handler - otherwise it is already okay
					if (typeof target === 'number') {
						var targetIdx =
							target < 0
								? dt.columns().eq(0).length + target
								: target;

						if (dt.cell(this).index().column !== targetIdx) {
							return;
						}
					}

					// $().closest() includes itself in its check
					var row = dt.row($(this).closest('tr'));

					// Check event type to do an action
					if (e.type === 'click') {
						// The renderer is given as a function so the caller can execute it
						// only when they need (i.e. if hiding there is no point is running
						// the renderer)
						that._detailsDisplay(row, false);
					}
					else if (e.type === 'mousedown') {
						// For mouse users, prevent the focus ring from showing
						$(this).css('outline', 'none');
					}
					else if (e.type === 'mouseup') {
						// And then re-allow at the end of the click
						$(this).trigger('blur').css('outline', '');
					}
				}
			);
		}
	},

	/**
	 * Get the details to pass to a renderer for a row
	 * @param  {int} rowIdx Row index
	 * @private
	 */
	_detailsObj: function (rowIdx) {
		var that = this;
		var dt = this.s.dt;

		return $.map(this.s.columns, function (col, i) {
			// Never and control columns should not be passed to the renderer
			if (col.never || col.control) {
				return;
			}

			var dtCol = dt.settings()[0].aoColumns[i];

			return {
				className: dtCol.sClass,
				columnIndex: i,
				data: dt.cell(rowIdx, i).render(that.c.orthogonal),
				hidden: dt.column(i).visible() && !that.s.current[i],
				rowIndex: rowIdx,
				title: dt.column(i).title()
			};
		});
	},

	/**
	 * Find a breakpoint object from a name
	 *
	 * @param  {string} name Breakpoint name to find
	 * @return {object}      Breakpoint description object
	 * @private
	 */
	_find: function (name) {
		var breakpoints = this.c.breakpoints;

		for (var i = 0, ien = breakpoints.length; i < ien; i++) {
			if (breakpoints[i].name === name) {
				return breakpoints[i];
			}
		}
	},

	/**
	 * Re-create the contents of the child rows as the display has changed in
	 * some way.
	 *
	 * @private
	 */
	_redrawChildren: function () {
		var that = this;
		var dt = this.s.dt;

		dt.rows({ page: 'current' }).iterator('row', function (settings, idx) {
			that._detailsDisplay(dt.row(idx), true);
		});
	},

	/**
	 * Alter the table display for a resized viewport. This involves first
	 * determining what breakpoint the window currently is in, getting the
	 * column visibilities to apply and then setting them.
	 *
	 * @param  {boolean} forceRedraw Force a redraw
	 * @private
	 */
	_resize: function (forceRedraw) {
		var that = this;
		var dt = this.s.dt;
		var width = $(window).innerWidth();
		var breakpoints = this.c.breakpoints;
		var breakpoint = breakpoints[0].name;
		var columns = this.s.columns;
		var i, ien;
		var oldVis = this.s.current.slice();

		// Determine what breakpoint we are currently at
		for (i = breakpoints.length - 1; i >= 0; i--) {
			if (width <= breakpoints[i].width) {
				breakpoint = breakpoints[i].name;
				break;
			}
		}

		// Show the columns for that break point
		var columnsVis = this._columnsVisiblity(breakpoint);
		this.s.current = columnsVis;

		// Set the class before the column visibility is changed so event
		// listeners know what the state is. Need to determine if there are
		// any columns that are not visible but can be shown
		var collapsedClass = false;

		for (i = 0, ien = columns.length; i < ien; i++) {
			if (
				columnsVis[i] === false &&
				!columns[i].never &&
				!columns[i].control &&
				!dt.column(i).visible() === false
			) {
				collapsedClass = true;
				break;
			}
		}

		$(dt.table().node()).toggleClass('collapsed', collapsedClass);

		var changed = false;
		var visible = 0;
		var dtSettings = dt.settings()[0];
		var colGroup = $(dt.table().node()).children('colgroup');
		var colEls = dtSettings.aoColumns.map(function (col) {
			return col.colEl;
		});

		dt.columns()
			.eq(0)
			.each(function (colIdx, i) {
				// Do nothing on DataTables' hidden column - DT removes it from the table
				// so we need to slide back
				if (! dt.column(colIdx).visible()) {
					return;
				}

				if (columnsVis[i] === true) {
					visible++;
				}

				if (forceRedraw || columnsVis[i] !== oldVis[i]) {
					changed = true;
					that._setColumnVis(colIdx, columnsVis[i]);
				}

				// DataTables 2 uses `col` to define the width for a column
				// and this needs to run each time, as DataTables will change
				// the column width. We may need to reattach if we've removed
				// an element previously.
				if (! columnsVis[i]) {
					colEls[i].detach();
				}
				else {
					that._colGroupAttach(colGroup, colEls, i);
				}
			});

		if (changed) {
			dt.columns.adjust();

			this._redrawChildren();

			// Inform listeners of the change
			$(dt.table().node()).trigger('responsive-resize.dt', [
				dt,
				this._responsiveOnlyHidden()
			]);

			// If no records, update the "No records" display element
			if (dt.page.info().recordsDisplay === 0) {
				$('td', dt.table().body()).eq(0).attr('colspan', visible);
			}
		}

		that._controlClass();
	},

	/**
	 * Determine the width of each column in the table so the auto column hiding
	 * has that information to work with. This method is never going to be 100%
	 * perfect since column widths can change slightly per page, but without
	 * seriously compromising performance this is quite effective.
	 *
	 * @private
	 */
	_resizeAuto: function () {
		var dt = this.s.dt;
		var columns = this.s.columns;
		var that = this;
		var visibleColumns = dt
			.columns()
			.indexes()
			.filter(function (idx) {
				return dt.column(idx).visible();
			});

		// Are we allowed to do auto sizing?
		if (!this.c.auto) {
			return;
		}

		// Are there any columns that actually need auto-sizing, or do they all
		// have classes defined
		if (
			$.inArray(
				true,
				$.map(columns, function (c) {
					return c.auto;
				})
			) === -1
		) {
			return;
		}

		// Clone the table with the current data in it
		var clonedTable = dt.table().node().cloneNode(false);
		var clonedHeader = $(dt.table().header().cloneNode(false)).appendTo(
			clonedTable
		);
		var clonedFooter = $(dt.table().footer().cloneNode(false)).appendTo(
			clonedTable
		);
		var clonedBody = $(dt.table().body())
			.clone(false, false)
			.empty()
			.appendTo(clonedTable); // use jQuery because of IE8

		clonedTable.style.width = 'auto';

		// Header
		dt.table()
			.header.structure(visibleColumns)
			.forEach((row) => {
				var cells = row
					.filter(function (el) {
						return el ? true : false;
					})
					.map(function (el) {
						return $(el.cell)
							.clone(false)
							.css('display', 'table-cell')
							.css('width', 'auto')
							.css('min-width', 0);
					});

				$('<tr/>').append(cells).appendTo(clonedHeader);
			});

		// Always need an empty row that we can read widths from
		var emptyRow = $('<tr/>').appendTo(clonedBody);

		for (var i = 0; i < visibleColumns.count(); i++) {
			emptyRow.append('<td/>');
		}

		// Body rows
		if (this.c.details.renderer._responsiveMovesNodes) {
			// Slow but it allows for moving elements around the document
			dt.rows({ page: 'current' }).every(function (rowIdx) {
				var node = this.node();

				if (! node) {
					return;
				}

				// We clone the table's rows and cells to create the sizing table
				var tr = node.cloneNode(false);

				dt.cells(rowIdx, visibleColumns).every(function (rowIdx2, colIdx) {
					// If nodes have been moved out (listHiddenNodes), we need to
					// clone from the store
					var store = that.s.childNodeStore[rowIdx + '-' + colIdx];

					if (store) {
						$(this.node().cloneNode(false))
							.append($(store).clone())
							.appendTo(tr);
					}
					else {
						$(this.node()).clone(false).appendTo(tr);
					}
				});

				clonedBody.append(tr);
			});
		}
		else {
			// This is much faster, but it doesn't account for moving nodes around
			$(clonedBody)
				.append( $(dt.rows( { page: 'current' } ).nodes()).clone( false ) )
				.find( 'th, td' ).css( 'display', '' );
		}

		// Any cells which were hidden by Responsive in the host table, need to
		// be visible here for the calculations
		clonedBody.find('th, td').css('display', '');

		// Footer
		dt.table()
			.footer.structure(visibleColumns)
			.forEach((row) => {
				var cells = row
					.filter(function (el) {
						return el ? true : false;
					})
					.map(function (el) {
						return $(el.cell)
							.clone(false)
							.css('display', 'table-cell')
							.css('width', 'auto')
							.css('min-width', 0);
					});

				$('<tr/>').append(cells).appendTo(clonedFooter);
			});

		// In the inline case extra padding is applied to the first column to
		// give space for the show / hide icon. We need to use this in the
		// calculation
		if (this.c.details.type === 'inline') {
			$(clonedTable).addClass('dtr-inline collapsed');
		}

		// It is unsafe to insert elements with the same name into the DOM
		// multiple times. For example, cloning and inserting a checked radio
		// clears the chcecked state of the original radio.
		$(clonedTable).find('[name]').removeAttr('name');

		// A position absolute table would take the table out of the flow of
		// our container element, bypassing the height and width (Scroller)
		$(clonedTable).css('position', 'relative');

		var inserted = $('<div/>')
			.css({
				width: 1,
				height: 1,
				overflow: 'hidden',
				clear: 'both'
			})
			.append(clonedTable);

		inserted.insertBefore(dt.table().node());

		// The cloned table now contains the smallest that each column can be
		emptyRow.children().each(function (i) {
			var idx = dt.column.index('fromVisible', i);
			columns[idx].minWidth = this.offsetWidth || 0;
		});

		inserted.remove();
	},

	/**
	 * Get the state of the current hidden columns - controlled by Responsive only
	 */
	_responsiveOnlyHidden: function () {
		var dt = this.s.dt;

		return $.map(this.s.current, function (v, i) {
			// If the column is hidden by DataTables then it can't be hidden by
			// Responsive!
			if (dt.column(i).visible() === false) {
				return true;
			}
			return v;
		});
	},

	/**
	 * Set a column's visibility.
	 *
	 * We don't use DataTables' column visibility controls in order to ensure
	 * that column visibility can Responsive can no-exist. Since only IE8+ is
	 * supported (and all evergreen browsers of course) the control of the
	 * display attribute works well.
	 *
	 * @param {integer} col      Column index
	 * @param {boolean} showHide Show or hide (true or false)
	 * @private
	 */
	_setColumnVis: function (col, showHide) {
		var that = this;
		var dt = this.s.dt;
		var display = showHide ? '' : 'none'; // empty string will remove the attr

		this._setHeaderVis(col, showHide, dt.table().header.structure());
		this._setHeaderVis(col, showHide, dt.table().footer.structure());

		dt.column(col)
			.nodes()
			.to$()
			.css('display', display)
			.toggleClass('dtr-hidden', !showHide);

		// If the are child nodes stored, we might need to reinsert them
		if (!$.isEmptyObject(this.s.childNodeStore)) {
			dt.cells(null, col)
				.indexes()
				.each(function (idx) {
					that._childNodesRestore(dt, idx.row, idx.column);
				});
		}
	},

	/**
	 * Set the a column's visibility, taking into account multiple rows
	 * in a header / footer and colspan attributes
	 * @param {*} col
	 * @param {*} showHide
	 * @param {*} structure
	 */
	_setHeaderVis: function (col, showHide, structure) {
		var that = this;
		var display = showHide ? '' : 'none';

		// We use the `null`s in the structure array to indicate that a cell
		// should expand over that one if there is a colspan, but it might
		// also have been filled by a rowspan, so we need to expand the
		// rowspan cells down through the structure
		structure.forEach(function (row, rowIdx) {
			for (var col = 0; col < row.length; col++) {
				if (row[col] && row[col].rowspan > 1) {
					var span = row[col].rowspan;

					for (var i=1 ; i<span ; i++) {
						structure[rowIdx + i][col] = {};
					}
				}
			}
		});

		structure.forEach(function (row) {
			if (row[col] && row[col].cell) {
				$(row[col].cell)
					.css('display', display)
					.toggleClass('dtr-hidden', !showHide);
			}
			else {
				// In a colspan - need to rewind calc the new span since
				// display:none elements do not count as being spanned over
				var search = col;

				while (search >= 0) {
					if (row[search] && row[search].cell) {
						row[search].cell.colSpan = that._colspan(row, search);
						break;
					}

					search--;
				}
			}
		});
	},

	/**
	 * How many columns should this cell span
	 *
	 * @param {*} row Header structure row
	 * @param {*} idx The column index of the cell to span
	 */
	_colspan: function (row, idx) {
		var colspan = 1;

		for (var col = idx + 1; col < row.length; col++) {
			if (row[col] === null && this.s.current[col]) {
				// colspan and not hidden by Responsive
				colspan++;
			}
			else if (row[col]) {
				// Got the next cell, jump out
				break;
			}
		}

		return colspan;
	},

	/**
	 * Update the cell tab indexes for keyboard accessibility. This is called on
	 * every table draw - that is potentially inefficient, but also the least
	 * complex option given that column visibility can change on the fly. Its a
	 * shame user-focus was removed from CSS 3 UI, as it would have solved this
	 * issue with a single CSS statement.
	 *
	 * @private
	 */
	_tabIndexes: function () {
		var dt = this.s.dt;
		var cells = dt.cells({ page: 'current' }).nodes().to$();
		var ctx = dt.settings()[0];
		var target = this.c.details.target;

		cells.filter('[data-dtr-keyboard]').removeData('[data-dtr-keyboard]');

		if (typeof target === 'number') {
			dt.cells(null, target, { page: 'current' })
				.nodes()
				.to$()
				.attr('tabIndex', ctx.iTabIndex)
				.data('dtr-keyboard', 1);
		}
		else {
			// This is a bit of a hack - we need to limit the selected nodes to just
			// those of this table
			if (target === 'td:first-child, th:first-child') {
				target = '>td:first-child, >th:first-child';
			}

			var rows = dt.rows({ page: 'current' }).nodes();
			var nodes = target === 'tr'
				? $(rows)
				: $(target, rows);

			nodes
				.attr('tabIndex', ctx.iTabIndex)
				.data('dtr-keyboard', 1);
		}
	}
});

/**
 * List of default breakpoints. Each item in the array is an object with two
 * properties:
 *
 * * `name` - the breakpoint name.
 * * `width` - the breakpoint width
 *
 * @name Responsive.breakpoints
 * @static
 */
Responsive.breakpoints = [
	{ name: 'desktop', width: Infinity },
	{ name: 'tablet-l', width: 1024 },
	{ name: 'tablet-p', width: 768 },
	{ name: 'mobile-l', width: 480 },
	{ name: 'mobile-p', width: 320 }
];

/**
 * Display methods - functions which define how the hidden data should be shown
 * in the table.
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.display = {
	childRow: function (row, update, render) {
		var rowNode = $(row.node());

		if (update) {
			if (rowNode.hasClass('dtr-expanded')) {
				row.child(render(), 'child').show();

				return true;
			}
		}
		else {
			if (!rowNode.hasClass('dtr-expanded')) {
				var rendered = render();

				if (rendered === false) {
					return false;
				}

				row.child(rendered, 'child').show();
				return true;
			}
			else {
				row.child(false);

				return false;
			}
		}
	},

	childRowImmediate: function (row, update, render) {
		var rowNode = $(row.node());

		if (
			(!update && rowNode.hasClass('dtr-expanded')) ||
			!row.responsive.hasHidden()
		) {
			// User interaction and the row is show, or nothing to show
			row.child(false);

			return false;
		}
		else {
			// Display
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			row.child(rendered, 'child').show();

			return true;
		}
	},

	// This is a wrapper so the modal options for Bootstrap and jQuery UI can
	// have options passed into them. This specific one doesn't need to be a
	// function but it is for consistency in the `modal` name
	modal: function (options) {
		return function (row, update, render, closeCallback) {
			var modal;
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			if (!update) {
				// Show a modal
				var close = function () {
					modal.remove(); // will tidy events for us
					$(document).off('keypress.dtr');
					$(row.node()).removeClass('dtr-expanded');

					closeCallback();
				};

				modal = $('<div class="dtr-modal"/>')
					.append(
						$('<div class="dtr-modal-display"/>')
							.append(
								$('<div class="dtr-modal-content"/>')
									.data('dtr-row-idx', row.index())
									.append(rendered)
							)
							.append(
								$(
									'<div class="dtr-modal-close">&times;</div>'
								).click(function () {
									close();
								})
							)
					)
					.append(
						$('<div class="dtr-modal-background"/>').click(
							function () {
								close();
							}
						)
					)
					.appendTo('body');

				$(row.node()).addClass('dtr-expanded');

				$(document).on('keyup.dtr', function (e) {
					if (e.keyCode === 27) {
						e.stopPropagation();

						close();
					}
				});
			}
			else {
				modal = $('div.dtr-modal-content');

				if (modal.length && row.index() === modal.data('dtr-row-idx')) {
					modal.empty().append(rendered);
				}
				else {
					// Modal not shown, nothing to update
					return null;
				}
			}

			if (options && options.header) {
				$('div.dtr-modal-content').prepend(
					'<h2>' + options.header(row) + '</h2>'
				);
			}

			return true;
		};
	}
};

/**
 * Display methods - functions which define how the hidden data should be shown
 * in the table.
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.renderer = {
	listHiddenNodes: function () {
		var fn = function (api, rowIdx, columns) {
			var that = this;
			var ul = $(
				'<ul data-dtr-index="' + rowIdx + '" class="dtr-details"/>'
			);
			var found = false;

			$.each(columns, function (i, col) {
				if (col.hidden) {
					var klass = col.className
						? 'class="' + col.className + '"'
						: '';

					$(
						'<li ' +
							klass +
							' data-dtr-index="' +
							col.columnIndex +
							'" data-dt-row="' +
							col.rowIndex +
							'" data-dt-column="' +
							col.columnIndex +
							'">' +
							'<span class="dtr-title">' +
							col.title +
							'</span> ' +
							'</li>'
					)
						.append(
							$('<span class="dtr-data"/>').append(
								that._childNodes(
									api,
									col.rowIndex,
									col.columnIndex
								)
							)
						) // api.cell( col.rowIndex, col.columnIndex ).node().childNodes ) )
						.appendTo(ul);

					found = true;
				}
			});

			return found ? ul : false;
		};

		fn._responsiveMovesNodes = true;

		return fn;
	},

	listHidden: function () {
		return function (api, rowIdx, columns) {
			var data = $.map(columns, function (col) {
				var klass = col.className
					? 'class="' + col.className + '"'
					: '';

				return col.hidden
					? '<li ' +
							klass +
							' data-dtr-index="' +
							col.columnIndex +
							'" data-dt-row="' +
							col.rowIndex +
							'" data-dt-column="' +
							col.columnIndex +
							'">' +
							'<span class="dtr-title">' +
							col.title +
							'</span> ' +
							'<span class="dtr-data">' +
							col.data +
							'</span>' +
							'</li>'
					: '';
			}).join('');

			return data
				? $(
						'<ul data-dtr-index="' +
							rowIdx +
							'" class="dtr-details"/>'
				).append(data)
				: false;
		};
	},

	tableAll: function (options) {
		options = $.extend(
			{
				tableClass: ''
			},
			options
		);

		return function (api, rowIdx, columns) {
			var data = $.map(columns, function (col) {
				var klass = col.className
					? 'class="' + col.className + '"'
					: '';

				return (
					'<tr ' +
					klass +
					' data-dt-row="' +
					col.rowIndex +
					'" data-dt-column="' +
					col.columnIndex +
					'">' +
					'<td>' +
					( '' !== col.title
						? col.title + ':'
						: ''
					) +
					'</td> ' +
					'<td>' +
					col.data +
					'</td>' +
					'</tr>'
				);
			}).join('');

			return $(
				'<table class="' +
					options.tableClass +
					' dtr-details" width="100%"/>'
			).append(data);
		};
	}
};

/**
 * Responsive default settings for initialisation
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.defaults = {
	/**
	 * List of breakpoints for the instance. Note that this means that each
	 * instance can have its own breakpoints. Additionally, the breakpoints
	 * cannot be changed once an instance has been creased.
	 *
	 * @type {Array}
	 * @default Takes the value of `Responsive.breakpoints`
	 */
	breakpoints: Responsive.breakpoints,

	/**
	 * Enable / disable auto hiding calculations. It can help to increase
	 * performance slightly if you disable this option, but all columns would
	 * need to have breakpoint classes assigned to them
	 *
	 * @type {Boolean}
	 * @default  `true`
	 */
	auto: true,

	/**
	 * Details control. If given as a string value, the `type` property of the
	 * default object is set to that value, and the defaults used for the rest
	 * of the object - this is for ease of implementation.
	 *
	 * The object consists of the following properties:
	 *
	 * * `display` - A function that is used to show and hide the hidden details
	 * * `renderer` - function that is called for display of the child row data.
	 *   The default function will show the data from the hidden columns
	 * * `target` - Used as the selector for what objects to attach the child
	 *   open / close to
	 * * `type` - `false` to disable the details display, `inline` or `column`
	 *   for the two control types
	 *
	 * @type {Object|string}
	 */
	details: {
		display: Responsive.display.childRow,

		renderer: Responsive.renderer.listHidden(),

		target: 0,

		type: 'inline'
	},

	/**
	 * Orthogonal data request option. This is used to define the data type
	 * requested when Responsive gets the data to show in the child row.
	 *
	 * @type {String}
	 */
	orthogonal: 'display'
};

/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register('responsive()', function () {
	return this;
});

Api.register('responsive.index()', function (li) {
	li = $(li);

	return {
		column: li.data('dtr-index'),
		row: li.parent().data('dtr-index')
	};
});

Api.register('responsive.rebuild()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx._responsive) {
			ctx._responsive._classLogic();
		}
	});
});

Api.register('responsive.recalc()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx._responsive) {
			ctx._responsive._resizeAuto();
			ctx._responsive._resize();
		}
	});
});

Api.register('responsive.hasHidden()', function () {
	var ctx = this.context[0];

	return ctx._responsive
		? $.inArray(false, ctx._responsive._responsiveOnlyHidden()) !== -1
		: false;
});

Api.registerPlural(
	'columns().responsiveHidden()',
	'column().responsiveHidden()',
	function () {
		return this.iterator(
			'column',
			function (settings, column) {
				return settings._responsive
					? settings._responsive._responsiveOnlyHidden()[column]
					: false;
			},
			1
		);
	}
);

/**
 * Version information
 *
 * @name Responsive.version
 * @static
 */
Responsive.version = '3.0.4';

$.fn.dataTable.Responsive = Responsive;
$.fn.DataTable.Responsive = Responsive;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtr', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	if (
		$(settings.nTable).hasClass('responsive') ||
		$(settings.nTable).hasClass('dt-responsive') ||
		settings.oInit.responsive ||
		DataTable.defaults.responsive
	) {
		var init = settings.oInit.responsive;

		if (init !== false) {
			new Responsive(settings, $.isPlainObject(init) ? init : {});
		}
	}
});


return DataTable;
}));


/*! Bootstrap 5 integration for DataTables' Responsive
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-responsive'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.Responsive ) {
				require('datatables.net-responsive')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var _display = DataTable.Responsive.display;
var _original = _display.modal;
var _modal = $(
	'<div class="modal fade dtr-bs-modal" role="dialog">' +
		'<div class="modal-dialog" role="document">' +
		'<div class="modal-content">' +
		'<div class="modal-header">' +
		'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
		'</div>' +
		'<div class="modal-body"/>' +
		'</div>' +
		'</div>' +
		'</div>'
);
var modal;

// Note this could be undefined at the time of initialisation - the
// DataTable.Responsive.bootstrap function can be used to set a different
// bootstrap object
var _bs = window.bootstrap;

DataTable.Responsive.bootstrap = function (bs) {
	_bs = bs;
};

// Get the Bootstrap library from locally set (legacy) or from DT.
function getBs() {
	let dtBs = DataTable.use('bootstrap');

	if (dtBs) {
		return dtBs;
	}

	if (_bs) {
		return _bs;
	}

	throw new Error('No Bootstrap library. Set it with `DataTable.use(bootstrap);`');
}

_display.modal = function (options) {
	if (!modal && _bs.Modal) {
		let localBs = getBs();
		modal = new localBs.Modal(_modal[0]);
	}

	return function (row, update, render, closeCallback) {
		if (! modal) {
			return _original(row, update, render, closeCallback);
		}
		else {
			var rendered = render();

			if (rendered === false) {
				return false;
			}

			if (!update) {
				if (options && options.header) {
					var header = _modal.find('div.modal-header');
					var button = header.find('button').detach();

					header
						.empty()
						.append('<h4 class="modal-title">' + options.header(row) + '</h4>')
						.append(button);
				}

				_modal.find('div.modal-body').empty().append(rendered);

				_modal
					.data('dtr-row-idx', row.index())
					.one('hidden.bs.modal', closeCallback)
					.appendTo('body');

				modal.show();
			}
			else {
				if ($.contains(document, _modal[0]) && row.index() === _modal.data('dtr-row-idx')) {
					_modal.find('div.modal-body').empty().append(rendered);
				}
				else {
					// Modal not shown for this row - do nothing
					return null;
				}
			}

			return true;
		}
	};
};


return DataTable;
}));


/*! RowReorder 1.5.0
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     RowReorder
 * @description Row reordering extension for DataTables
 * @version     1.5.0
 * @author      SpryMedia Ltd
 * @contact     datatables.net
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/**
 * RowReorder provides the ability in DataTables to click and drag rows to
 * reorder them. When a row is dropped the data for the rows effected will be
 * updated to reflect the change. Normally this data point should also be the
 * column being sorted upon in the DataTable but this does not need to be the
 * case. RowReorder implements a "data swap" method - so the rows being
 * reordered take the value of the data point from the row that used to occupy
 * the row's new position.
 *
 * Initialisation is done by either:
 *
 * * `rowReorder` parameter in the DataTable initialisation object
 * * `new DataTable.RowReorder( table, opts )` after DataTables
 *   initialisation.
 *
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.11
 */
var RowReorder = function (dt, opts) {
	// Sanity check that we are using DataTables 1.10 or newer
	if (!DataTable.versionCheck || !DataTable.versionCheck('1.11')) {
		throw 'DataTables RowReorder requires DataTables 1.11 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend(true, {}, DataTable.defaults.rowReorder, RowReorder.defaults, opts);

	// Internal settings
	this.s = {
		/** @type {integer} Scroll body top cache */
		bodyTop: null,

		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api(dt),

		/** @type {function} Data fetch function */
		getDataFn: DataTable.util.get(this.c.dataSrc),

		/** @type {array} Pixel positions for row insertion calculation */
		middles: null,

		/** @type {Object} Cached dimension information for use in the mouse move event handler */
		scroll: {},

		/** @type {integer} Interval object used for smooth scrolling */
		scrollInterval: null,

		/** @type {function} Data set function */
		setDataFn: DataTable.util.set(this.c.dataSrc),

		/** @type {Object} Mouse down information */
		start: {
			top: 0,
			left: 0,
			offsetTop: 0,
			offsetLeft: 0,
			nodes: [],
			rowIndex: 0
		},

		/** @type {integer} Window height cached value */
		windowHeight: 0,

		/** @type {integer} Document outer height cached value */
		documentOuterHeight: 0,

		/** @type {integer} DOM clone outer height cached value */
		domCloneOuterHeight: 0,

		/** @type {integer} Flag used for signing if the drop is enabled or not */
		dropAllowed: true
	};

	// DOM items
	this.dom = {
		/** @type {jQuery} Cloned row being moved around */
		clone: null,
		cloneParent: null,

		/** @type {jQuery} DataTables scrolling container */
		dtScroll: $('div.dataTables_scrollBody, div.dt-scroll-body', this.s.dt.table().container())
	};

	// Check if row reorder has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var existing = settings.rowreorder;

	if (existing) {
		return existing;
	}

	if (!this.dom.dtScroll.length) {
		this.dom.dtScroll = $(this.s.dt.table().container(), 'tbody');
	}

	settings.rowreorder = this;
	this._constructor();
};

$.extend(RowReorder.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the RowReorder instance
	 *
	 * @private
	 */
	_constructor: function () {
		var that = this;
		var dt = this.s.dt;
		var table = $(dt.table().node());

		// Need to be able to calculate the row positions relative to the table
		if (table.css('position') === 'static') {
			table.css('position', 'relative');
		}

		// listen for mouse down on the target column - we have to implement
		// this rather than using HTML5 drag and drop as drag and drop doesn't
		// appear to work on table rows at this time. Also mobile browsers are
		// not supported.
		// Use `table().container()` rather than just the table node for IE8 -
		// otherwise it only works once...
		$(dt.table().container()).on(
			'mousedown.rowReorder touchstart.rowReorder',
			this.c.selector,
			function (e) {
				if (!that.c.enable) {
					return;
				}

				// Ignore excluded children of the selector
				if ($(e.target).is(that.c.excludedChildren)) {
					return true;
				}

				var tr = $(this).closest('tr');
				var row = dt.row(tr);

				// Double check that it is a DataTable row
				if (row.any()) {
					that._emitEvent('pre-row-reorder', {
						node: row.node(),
						index: row.index()
					});

					that._mouseDown(e, tr);
					return false;
				}
			}
		);

		dt.on('destroy.rowReorder', function () {
			$(dt.table().container()).off('.rowReorder');
			dt.off('.rowReorder');
		});

		this._keyup = this._keyup.bind(this);
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Cache the measurements that RowReorder needs in the mouse move handler
	 * to attempt to speed things up, rather than reading from the DOM.
	 *
	 * @private
	 */
	_cachePositions: function () {
		var dt = this.s.dt;

		// Frustratingly, if we add `position:relative` to the tbody, the
		// position is still relatively to the parent. So we need to adjust
		// for that
		var headerHeight = $(dt.table().node()).find('thead').outerHeight();

		// Need to pass the nodes through jQuery to get them in document order,
		// not what DataTables thinks it is, since we have been altering the
		// order
		var nodes = $.unique(dt.rows({ page: 'current' }).nodes().toArray());
		var middles = $.map(nodes, function (node, i) {
			var top = $(node).position().top - headerHeight;

			return (top + top + $(node).outerHeight()) / 2;
		});

		this.s.middles = middles;
		this.s.bodyTop = $(dt.table().body()).offset().top;
		this.s.windowHeight = $(window).height();
		this.s.documentOuterHeight = $(document).outerHeight();
		this.s.bodyArea = this._calcBodyArea();
	},

	/**
	 * Clone a row so it can be floated around the screen
	 *
	 * @param  {jQuery} target Node to be cloned
	 * @private
	 */
	_clone: function (target) {
		var dt = this.s.dt;
		var clone = $(dt.table().node().cloneNode(false))
			.addClass('dt-rowReorder-float')
			.append('<tbody/>')
			.append(target.clone(false));

		// Match the table and column widths - read all sizes before setting
		// to reduce reflows
		var tableWidth = target.outerWidth();
		var tableHeight = target.outerHeight();
		var scrollBody = $($(this.s.dt.table().node()).parent());
		var scrollWidth = scrollBody.width();
		var scrollLeft = scrollBody.scrollLeft();
		var sizes = target.children().map(function () {
			return $(this).width();
		});

		clone
			.width(tableWidth)
			.height(tableHeight)
			.find('tr')
			.children()
			.each(function (i) {
				this.style.width = sizes[i] + 'px';
			});

		var cloneParent = $('<div>')
			.addClass('dt-rowReorder-float-parent')
			.width(scrollWidth)
			.append(clone)
			.appendTo('body')
			.scrollLeft(scrollLeft);

		// Insert into the document to have it floating around

		this.dom.clone = clone;
		this.dom.cloneParent = cloneParent;
		this.s.domCloneOuterHeight = clone.outerHeight();
	},

	/**
	 * Update the cloned item's position in the document
	 *
	 * @param  {object} e Event giving the mouse's position
	 * @private
	 */
	_clonePosition: function (e) {
		var start = this.s.start;
		var topDiff = this._eventToPage(e, 'Y') - start.top;
		var leftDiff = this._eventToPage(e, 'X') - start.left;
		var snap = this.c.snapX;
		var left;
		var top = topDiff + start.offsetTop;

		if (snap === true) {
			left = start.offsetLeft;
		}
		else if (typeof snap === 'number') {
			left = start.offsetLeft + snap;
		}
		else {
			left = leftDiff + start.offsetLeft + this.dom.cloneParent.scrollLeft();
		}

		if (top < 0) {
			top = 0;
		}
		else if (top + this.s.domCloneOuterHeight > this.s.documentOuterHeight) {
			top = this.s.documentOuterHeight - this.s.domCloneOuterHeight;
		}

		this.dom.cloneParent.css({
			top: top,
			left: left
		});
	},

	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param  {string} name Event name
	 * @param  {array} args Event arguments
	 * @private
	 */
	_emitEvent: function ( name, args )
	{
		var ret;

		this.s.dt.iterator( 'table', function ( ctx, i ) {
			var innerRet = $(ctx.nTable).triggerHandler( name+'.dt', args );

			if (innerRet !== undefined) {
				ret = innerRet;
			}
		} );

		return ret;
	},

	/**
	 * Get pageX/Y position from an event, regardless of if it is a mouse or
	 * touch event.
	 *
	 * @param  {object} e Event
	 * @param  {string} pos X or Y (must be a capital)
	 * @private
	 */
	_eventToPage: function (e, pos) {
		if (e.type.indexOf('touch') !== -1) {
			return e.originalEvent.touches[0]['page' + pos];
		}

		return e['page' + pos];
	},

	/**
	 * Mouse down event handler. Read initial positions and add event handlers
	 * for the move.
	 *
	 * @param  {object} e      Mouse event
	 * @param  {jQuery} target TR element that is to be moved
	 * @private
	 */
	_mouseDown: function (e, target) {
		var that = this;
		var dt = this.s.dt;
		var start = this.s.start;
		var cancelable = this.c.cancelable;

		var offset = target.offset();
		start.top = this._eventToPage(e, 'Y');
		start.left = this._eventToPage(e, 'X');
		start.offsetTop = offset.top;
		start.offsetLeft = offset.left;
		start.nodes = $.unique(dt.rows({ page: 'current' }).nodes().toArray());

		this._cachePositions();
		this._clone(target);
		this._clonePosition(e);

		var bodyY = this._eventToPage(e, 'Y') - this.s.bodyTop;
		start.rowIndex = this._calcRowIndexByPos(bodyY);

		this.dom.target = target;
		target.addClass('dt-rowReorder-moving');

		$(document)
			.on('mouseup.rowReorder touchend.rowReorder', function (e) {
				that._mouseUp(e);
			})
			.on('mousemove.rowReorder touchmove.rowReorder', function (e) {
				that._mouseMove(e);
			});

		// Check if window is x-scrolling - if not, disable it for the duration
		// of the drag
		if ($(window).width() === $(document).width()) {
			$(document.body).addClass('dt-rowReorder-noOverflow');
		}

		// Cache scrolling information so mouse move doesn't need to read.
		// This assumes that the window and DT scroller will not change size
		// during an row drag, which I think is a fair assumption
		var scrollWrapper = this.dom.dtScroll;
		this.s.scroll = {
			windowHeight: $(window).height(),
			windowWidth: $(window).width(),
			dtTop: scrollWrapper.length ? scrollWrapper.offset().top : null,
			dtLeft: scrollWrapper.length ? scrollWrapper.offset().left : null,
			dtHeight: scrollWrapper.length ? scrollWrapper.outerHeight() : null,
			dtWidth: scrollWrapper.length ? scrollWrapper.outerWidth() : null
		};

		// Add keyup handler if dragging is cancelable
		if (cancelable) {
			$(document).on('keyup', this._keyup);
		}
	},

	/**
	 * Mouse move event handler - move the cloned row and shuffle the table's
	 * rows if required.
	 *
	 * @param  {object} e Mouse event
	 * @private
	 */
	_mouseMove: function (e) {
		this._clonePosition(e);

		var start = this.s.start;
		var cancelable = this.c.cancelable;

		if (cancelable) {
			var bodyArea = this.s.bodyArea;
			var cloneArea = this._calcCloneParentArea();
			this.s.dropAllowed = this._rectanglesIntersect(bodyArea, cloneArea);

			this.s.dropAllowed
				? $(this.dom.cloneParent).removeClass('drop-not-allowed')
				: $(this.dom.cloneParent).addClass('drop-not-allowed');
		}

		// Transform the mouse position into a position in the table's body
		var bodyY = this._eventToPage(e, 'Y') - this.s.bodyTop;
		var middles = this.s.middles;
		var insertPoint = null;

		// Determine where the row should be inserted based on the mouse
		// position
		for (var i = 0, ien = middles.length; i < ien; i++) {
			if (bodyY < middles[i]) {
				insertPoint = i;
				break;
			}
		}

		if (insertPoint === null) {
			insertPoint = middles.length;
		}

		if (cancelable) {
			if (!this.s.dropAllowed) {
				// Move the row back to its original position becasuse the drop is not allowed
				insertPoint =
					start.rowIndex > this.s.lastInsert ? start.rowIndex + 1 : start.rowIndex;
			}

			this.dom.target.toggleClass('dt-rowReorder-moving', this.s.dropAllowed);
		}

		this._moveTargetIntoPosition(insertPoint);

		this._shiftScroll(e);
	},

	/**
	 * Mouse up event handler - release the event handlers and perform the
	 * table updates
	 *
	 * @param  {object} e Mouse event
	 * @private
	 */
	_mouseUp: function (e) {
		var that = this;
		var dt = this.s.dt;
		var i, ien;
		var dataSrc = this.c.dataSrc;
		var dropAllowed = this.s.dropAllowed;

		if (!dropAllowed) {
			that._cancel();
			return;
		}

		// Calculate the difference
		var startNodes = this.s.start.nodes;
		var endNodes = $.unique(dt.rows({ page: 'current' }).nodes().toArray());
		var idDiff = {};
		var fullDiff = [];
		var diffNodes = [];
		var getDataFn = this.s.getDataFn;
		var setDataFn = this.s.setDataFn;

		for (i = 0, ien = startNodes.length; i < ien; i++) {
			if (startNodes[i] !== endNodes[i]) {
				var id = dt.row(endNodes[i]).id();
				var endRowData = dt.row(endNodes[i]).data();
				var startRowData = dt.row(startNodes[i]).data();

				if (id) {
					idDiff[id] = getDataFn(startRowData);
				}

				fullDiff.push({
					node: endNodes[i],
					oldData: getDataFn(endRowData),
					newData: getDataFn(startRowData),
					newPosition: i,
					oldPosition: $.inArray(endNodes[i], startNodes)
				});

				diffNodes.push(endNodes[i]);
			}
		}

		// Create event args
		var eventArgs = [
			fullDiff,
			{
				dataSrc: dataSrc,
				nodes: diffNodes,
				values: idDiff,
				triggerRow: dt.row(this.dom.target),
				originalEvent: e
			}
		];

		// Emit event
		var eventResult = this._emitEvent( 'row-reorder', eventArgs );

		if (eventResult === false) {
			that._cancel();
			return;
		}

		// Remove cloned elements, handlers, etc
		this._cleanupDragging();

		var update = function () {
			if (that.c.update) {
				for (i = 0, ien = fullDiff.length; i < ien; i++) {
					var row = dt.row(fullDiff[i].node);
					var rowData = row.data();

					setDataFn(rowData, fullDiff[i].newData);

					// Invalidate the cell that has the same data source as the dataSrc
					dt.columns().every(function () {
						if (this.dataSrc() === dataSrc) {
							dt.cell(fullDiff[i].node, this.index()).invalidate('data');
						}
					});
				}

				// Trigger row reordered event
				that._emitEvent('row-reordered', eventArgs);

				dt.draw(false);
			}
		};

		// Editor interface
		if (this.c.editor) {
			// Disable user interaction while Editor is submitting
			this.c.enable = false;

			this.c.editor
				.edit(diffNodes, false, $.extend({ submit: 'changed' }, this.c.formOptions))
				.multiSet(dataSrc, idDiff)
				.one('preSubmitCancelled.rowReorder', function () {
					that.c.enable = true;
					that.c.editor.off('.rowReorder');
					dt.draw(false);
				})
				.one('submitUnsuccessful.rowReorder', function () {
					dt.draw(false);
				})
				.one('submitSuccess.rowReorder', function () {
					update();
				})
				.one('submitComplete', function () {
					that.c.enable = true;
					that.c.editor.off('.rowReorder');
				})
				.submit();
		}
		else {
			update();
		}
	},

	/**
	 * Moves the current target into the given position within the table
	 * and caches the new positions
	 *
	 * @param  {integer} insertPoint Position
	 * @private
	 */
	_moveTargetIntoPosition: function (insertPoint) {
		var dt = this.s.dt;

		// Perform the DOM shuffle if it has changed from last time
		if (this.s.lastInsert === null || this.s.lastInsert !== insertPoint) {
			var nodes = $.unique(dt.rows({ page: 'current' }).nodes().toArray());
			var insertPlacement = '';

			if (insertPoint > this.s.lastInsert) {
				this.dom.target.insertAfter(nodes[insertPoint - 1]);
				insertPlacement = 'after';
			}
			else {
				this.dom.target.insertBefore(nodes[insertPoint]);
				insertPlacement = 'before';
			}

			this._cachePositions();

			this.s.lastInsert = insertPoint;

			this._emitEvent('row-reorder-changed', {
				insertPlacement,
				insertPoint,
				row: dt.row(this.dom.target)
			});
		}
	},

	/**
	 * Removes the cloned elements, event handlers, scrolling intervals, etc
	 *
	 * @private
	 */
	_cleanupDragging: function () {
		var cancelable = this.c.cancelable;

		this.dom.clone.remove();
		this.dom.cloneParent.remove();
		this.dom.clone = null;
		this.dom.cloneParent = null;

		this.dom.target.removeClass('dt-rowReorder-moving');
		//this.dom.target = null;

		$(document).off('.rowReorder');
		$(document.body).removeClass('dt-rowReorder-noOverflow');

		clearInterval(this.s.scrollInterval);
		this.s.scrollInterval = null;

		if (cancelable) {
			$(document).off('keyup', this._keyup);
		}
	},

	/**
	 * Move the window and DataTables scrolling during a drag to scroll new
	 * content into view.
	 *
	 * This matches the `_shiftScroll` method used in AutoFill, but only
	 * horizontal scrolling is considered here.
	 *
	 * @param  {object} e Mouse move event object
	 * @private
	 */
	_shiftScroll: function (e) {
		var that = this;
		var scroll = this.s.scroll;
		var runInterval = false;
		var scrollSpeed = 5;
		var buffer = 65;
		var windowY = e.pageY - document.body.scrollTop,
			windowVert,
			dtVert;

		// Window calculations - based on the mouse position in the window,
		// regardless of scrolling
		if (windowY < $(window).scrollTop() + buffer) {
			windowVert = scrollSpeed * -1;
		}
		else if (windowY > scroll.windowHeight + $(window).scrollTop() - buffer) {
			windowVert = scrollSpeed;
		}

		// DataTables scrolling calculations - based on the table's position in
		// the document and the mouse position on the page
		if (scroll.dtTop !== null && e.pageY < scroll.dtTop + buffer) {
			dtVert = scrollSpeed * -1;
		}
		else if (scroll.dtTop !== null && e.pageY > scroll.dtTop + scroll.dtHeight - buffer) {
			dtVert = scrollSpeed;
		}

		// This is where it gets interesting. We want to continue scrolling
		// without requiring a mouse move, so we need an interval to be
		// triggered. The interval should continue until it is no longer needed,
		// but it must also use the latest scroll commands (for example consider
		// that the mouse might move from scrolling up to scrolling left, all
		// with the same interval running. We use the `scroll` object to "pass"
		// this information to the interval. Can't use local variables as they
		// wouldn't be the ones that are used by an already existing interval!
		if (windowVert || dtVert) {
			scroll.windowVert = windowVert;
			scroll.dtVert = dtVert;
			runInterval = true;
		}
		else if (this.s.scrollInterval) {
			// Don't need to scroll - remove any existing timer
			clearInterval(this.s.scrollInterval);
			this.s.scrollInterval = null;
		}

		// If we need to run the interval to scroll and there is no existing
		// interval (if there is an existing one, it will continue to run)
		if (!this.s.scrollInterval && runInterval) {
			this.s.scrollInterval = setInterval(function () {
				// Don't need to worry about setting scroll <0 or beyond the
				// scroll bound as the browser will just reject that.
				if (scroll.windowVert) {
					var top = $(document).scrollTop();
					$(document).scrollTop(top + scroll.windowVert);

					if (top !== $(document).scrollTop()) {
						var move = parseFloat(that.dom.cloneParent.css('top'));
						that.dom.cloneParent.css('top', move + scroll.windowVert);
					}
				}

				// DataTables scrolling
				if (scroll.dtVert) {
					var scroller = that.dom.dtScroll[0];

					if (scroll.dtVert) {
						scroller.scrollTop += scroll.dtVert;
					}
				}
			}, 20);
		}
	},

	/**
	 * Calculates the current area of the table body and returns it as a rectangle
	 *
	 * @private
	 */
	_calcBodyArea: function (e) {
		var dt = this.s.dt;
		var offset = $(dt.table().body()).offset();
		var area = {
			left: offset.left,
			top: offset.top,
			right: offset.left + $(dt.table().body()).width(),
			bottom: offset.top + $(dt.table().body()).height()
		};

		return area;
	},

	/**
	 * Calculates the current area of the cloned parent element and returns it as a rectangle
	 *
	 * @private
	 */
	_calcCloneParentArea: function (e) {
		var offset = $(this.dom.cloneParent).offset();
		var area = {
			left: offset.left,
			top: offset.top,
			right: offset.left + $(this.dom.cloneParent).width(),
			bottom: offset.top + $(this.dom.cloneParent).height()
		};

		return area;
	},

	/**
	 * Returns whether the given reactangles intersect or not
	 *
	 * @private
	 */
	_rectanglesIntersect: function (a, b) {
		var noOverlap =
			a.left >= b.right || b.left >= a.right || a.top >= b.bottom || b.top >= a.bottom;

		return !noOverlap;
	},

	/**
	 * Calculates the index of the row which lays under the given Y position or
	 * returns -1 if no such row
	 *
	 * @param  {integer} insertPoint Position
	 * @private
	 */
	_calcRowIndexByPos: function (bodyY) {
		// Determine where the row is located based on the mouse
		// position

		var dt = this.s.dt;
		var nodes = $.unique(dt.rows({ page: 'current' }).nodes().toArray());
		var rowIndex = -1;
		var headerHeight = $(dt.table().node()).find('thead').outerHeight();

		$.each(nodes, function (i, node) {
			var top = $(node).position().top - headerHeight;
			var bottom = top + $(node).outerHeight();

			if (bodyY >= top && bodyY <= bottom) {
				rowIndex = i;
			}
		});

		return rowIndex;
	},

	/**
	 * Handles key up events and cancels the dragging if ESC key is pressed
	 *
	 * @param  {object} e Mouse move event object
	 * @private
	 */
	_keyup: function (e) {
		var cancelable = this.c.cancelable;

		if (cancelable && e.which === 27) {
			// ESC key is up
			e.preventDefault();
			this._cancel();
		}
	},

	/**
	 * Cancels the dragging, moves target back into its original position
	 * and cleans up the dragging
	 *
	 * @param  {object} e Mouse move event object
	 * @private
	 */
	_cancel: function () {
		var start = this.s.start;
		var insertPoint = start.rowIndex > this.s.lastInsert ? start.rowIndex + 1 : start.rowIndex;

		this._moveTargetIntoPosition(insertPoint);

		this._cleanupDragging();

		// Emit event
		this._emitEvent('row-reorder-canceled', [this.s.start.rowIndex]);
	}
});

/**
 * RowReorder default settings for initialisation
 *
 * @namespace
 * @name RowReorder.defaults
 * @static
 */
RowReorder.defaults = {
	/**
	 * Data point in the host row's data source object for where to get and set
	 * the data to reorder. This will normally also be the sorting column.
	 *
	 * @type {Number}
	 */
	dataSrc: 0,

	/**
	 * Editor instance that will be used to perform the update
	 *
	 * @type {DataTable.Editor}
	 */
	editor: null,

	/**
	 * Enable / disable RowReorder's user interaction
	 * @type {Boolean}
	 */
	enable: true,

	/**
	 * Form options to pass to Editor when submitting a change in the row order.
	 * See the Editor `from-options` object for details of the options
	 * available.
	 * @type {Object}
	 */
	formOptions: {},

	/**
	 * Drag handle selector. This defines the element that when dragged will
	 * reorder a row.
	 *
	 * @type {String}
	 */
	selector: 'td:first-child',

	/**
	 * Optionally lock the dragged row's x-position. This can be `true` to
	 * fix the position match the host table's, `false` to allow free movement
	 * of the row, or a number to define an offset from the host table.
	 *
	 * @type {Boolean|number}
	 */
	snapX: false,

	/**
	 * Update the table's data on drop
	 *
	 * @type {Boolean}
	 */
	update: true,

	/**
	 * Selector for children of the drag handle selector that mouseDown events
	 * will be passed through to and drag will not activate
	 *
	 * @type {String}
	 */
	excludedChildren: 'a',

	/**
	 * Enable / disable the canceling of the drag & drop interaction
	 *
	 * @type {Boolean}
	 */
	cancelable: false
};

/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register('rowReorder()', function () {
	return this;
});

Api.register('rowReorder.enable()', function (toggle) {
	if (toggle === undefined) {
		toggle = true;
	}

	return this.iterator('table', function (ctx) {
		if (ctx.rowreorder) {
			ctx.rowreorder.c.enable = toggle;
		}
	});
});

Api.register('rowReorder.disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.rowreorder) {
			ctx.rowreorder.c.enable = false;
		}
	});
});

/**
 * Version information
 *
 * @name RowReorder.version
 * @static
 */
RowReorder.version = '1.5.0';

$.fn.dataTable.RowReorder = RowReorder;
$.fn.DataTable.RowReorder = RowReorder;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('init.dt.dtr', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.oInit.rowReorder;
	var defaults = DataTable.defaults.rowReorder;

	if (init || defaults) {
		var opts = $.extend({}, init, defaults);

		if (init !== false) {
			new RowReorder(settings, opts);
		}
	}
});


return DataTable;
}));


/*! Scroller 2.4.3
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * @summary     Scroller
 * @description Virtual rendering for DataTables
 * @version     2.4.3
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/**
 * Scroller is a virtual rendering plug-in for DataTables which allows large
 * datasets to be drawn on screen very quickly. What the virtual rendering means
 * is that only the visible portion of the table (and a bit to either side to make
 * the scrolling smooth) is drawn, while the scrolling container gives the
 * visual impression that the whole table is visible. This is done by making use
 * of the pagination abilities of DataTables and moving the table around in the
 * scrolling container DataTables adds to the page. The scrolling container is
 * forced to the height it would be for the full table display using an extra
 * element.
 *
 * Note that rows in the table MUST all be the same height. Information in a cell
 * which expands on to multiple lines will cause some odd behaviour in the scrolling.
 *
 * Scroller is initialised by simply including the letter 'S' in the sDom for the
 * table you want to have this feature enabled on. Note that the 'S' must come
 * AFTER the 't' parameter in `dom`.
 *
 * Key features include:
 *   <ul class="limit_length">
 *     <li>Speed! The aim of Scroller for DataTables is to make rendering large data sets fast</li>
 *     <li>Full compatibility with deferred rendering in DataTables for maximum speed</li>
 *     <li>Display millions of rows</li>
 *     <li>Integration with state saving in DataTables (scrolling position is saved)</li>
 *     <li>Easy to use</li>
 *   </ul>
 *
 *  @class
 *  @constructor
 *  @global
 *  @param {object} dt DataTables settings object or API instance
 *  @param {object} [opts={}] Configuration object for Scroller. Options
 *    are defined by {@link Scroller.defaults}
 *
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.11.0+
 */
var Scroller = function (dt, opts) {
	/* Sanity check - you just know it will happen */
	if (!(this instanceof Scroller)) {
		alert(
			"Scroller warning: Scroller must be initialised with the 'new' keyword."
		);
		return;
	}

	if (opts === undefined) {
		opts = {};
	}

	var dtApi = $.fn.dataTable.Api(dt);

	/**
	 * Settings object which contains customisable information for the Scroller instance
	 * @namespace
	 * @private
	 * @extends Scroller.defaults
	 */
	this.s = {
		/**
		 * DataTables settings object
		 *  @type     object
		 *  @default  Passed in as first parameter to constructor
		 */
		dt: dtApi.settings()[0],

		/**
		 * DataTables API instance
		 *  @type     DataTable.Api
		 */
		dtApi: dtApi,

		/**
		 * Pixel location of the top of the drawn table in the viewport
		 *  @type     int
		 *  @default  0
		 */
		tableTop: 0,

		/**
		 * Pixel location of the bottom of the drawn table in the viewport
		 *  @type     int
		 *  @default  0
		 */
		tableBottom: 0,

		/**
		 * Pixel location of the boundary for when the next data set should be loaded and drawn
		 * when scrolling up the way.
		 *  @type     int
		 *  @default  0
		 *  @private
		 */
		redrawTop: 0,

		/**
		 * Pixel location of the boundary for when the next data set should be loaded and drawn
		 * when scrolling down the way. Note that this is actually calculated as the offset from
		 * the top.
		 *  @type     int
		 *  @default  0
		 *  @private
		 */
		redrawBottom: 0,

		/**
		 * Auto row height or not indicator
		 *  @type     bool
		 *  @default  0
		 */
		autoHeight: true,

		/**
		 * Number of rows calculated as visible in the visible viewport
		 *  @type     int
		 *  @default  0
		 */
		viewportRows: 0,

		/**
		 * setTimeout reference for state saving, used when state saving is enabled in the DataTable
		 * and when the user scrolls the viewport in order to stop the cookie set taking too much
		 * CPU!
		 *  @type     int
		 *  @default  0
		 */
		stateTO: null,

		stateSaveThrottle: function () {},

		/**
		 * setTimeout reference for the redraw, used when server-side processing is enabled in the
		 * DataTables in order to prevent DoSing the server
		 *  @type     int
		 *  @default  null
		 */
		drawTO: null,

		heights: {
			jump: null,
			page: null,
			virtual: null,
			scroll: null,

			/**
			 * Height of rows in the table
			 *  @type     int
			 *  @default  0
			 */
			row: null,

			/**
			 * Pixel height of the viewport
			 *  @type     int
			 *  @default  0
			 */
			viewport: null,
			labelHeight: 0,
			xbar: 0
		},

		topRowFloat: 0,
		scrollDrawDiff: null,
		loaderVisible: false,
		forceReposition: false,
		baseRowTop: 0,
		baseScrollTop: 0,
		mousedown: false,
		lastScrollTop: 0
	};

	// @todo The defaults should extend a `c` property and the internal settings
	// only held in the `s` property. At the moment they are mixed
	this.s = $.extend(this.s, Scroller.oDefaults, opts);

	// Workaround for row height being read from height object (see above comment)
	this.s.heights.row = this.s.rowHeight;

	/**
	 * DOM elements used by the class instance
	 * @private
	 * @namespace
	 *
	 */
	this.dom = {
		force: document.createElement('div'),
		label: $('<div class="dts_label">0</div>'),
		scroller: null,
		table: null,
		loader: null
	};

	// Attach the instance to the DataTables instance so it can be accessed in
	// future. Don't initialise Scroller twice on the same table
	if (this.s.dt.oScroller) {
		return;
	}

	this.s.dt.oScroller = this;

	/* Let's do it */
	this.construct();
};

$.extend(Scroller.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods - to be exposed via the DataTables API
	 */

	/**
	 * Calculate and store information about how many rows are to be displayed
	 * in the scrolling viewport, based on current dimensions in the browser's
	 * rendering. This can be particularly useful if the table is initially
	 * drawn in a hidden element - for example in a tab.
	 *  @param {bool} [redraw=true] Redraw the table automatically after the recalculation, with
	 *    the new dimensions forming the basis for the draw.
	 *  @returns {void}
	 */
	measure: function (redraw) {
		if (this.s.autoHeight) {
			this._calcRowHeight();
		}

		var heights = this.s.heights;

		if (heights.row) {
			heights.viewport = this._parseHeight(
				$(this.dom.scroller).css('max-height')
			);

			this.s.viewportRows =
				parseInt(heights.viewport / heights.row, 10) + 1;
			this.s.dt._iDisplayLength =
				this.s.viewportRows * this.s.displayBuffer;
		}

		var label = this.dom.label.outerHeight();

		heights.xbar =
			this.dom.scroller.offsetHeight - this.dom.scroller.clientHeight;
		heights.labelHeight = label;

		if (redraw === undefined || redraw) {
			this.s.dtApi.draw(false);
		}
	},

	/**
	 * Get information about current displayed record range. This corresponds to
	 * the information usually displayed in the "Info" block of the table.
	 *
	 * @returns {object} info as an object:
	 *  {
	 *      start: {int}, // the 0-indexed record at the top of the viewport
	 *      end:   {int}, // the 0-indexed record at the bottom of the viewport
	 *  }
	 */
	pageInfo: function () {
		var dt = this.s.dt,
			iScrollTop = this.dom.scroller.scrollTop,
			iTotal = dt.fnRecordsDisplay(),
			iPossibleEnd = Math.ceil(
				this.pixelsToRow(
					iScrollTop + this.s.heights.viewport,
					false,
					this.s.ani
				)
			);

		return {
			start: Math.floor(this.pixelsToRow(iScrollTop, false, this.s.ani)),
			end: iTotal < iPossibleEnd ? iTotal - 1 : iPossibleEnd - 1
		};
	},

	/**
	 * Calculate the row number that will be found at the given pixel position
	 * (y-scroll).
	 *
	 * Please note that when the height of the full table exceeds 1 million
	 * pixels, Scroller switches into a non-linear mode for the scrollbar to fit
	 * all of the records into a finite area, but this function returns a linear
	 * value (relative to the last non-linear positioning).
	 *  @param {int} pixels Offset from top to calculate the row number of
	 *  @param {int} [intParse=true] If an integer value should be returned
	 *  @param {int} [virtual=false] Perform the calculations in the virtual domain
	 *  @returns {int} Row index
	 */
	pixelsToRow: function (pixels, intParse, virtual) {
		var diff = pixels - this.s.baseScrollTop;
		var row = virtual
			? (this._domain('physicalToVirtual', this.s.baseScrollTop) + diff) /
				this.s.heights.row
			: diff / this.s.heights.row + this.s.baseRowTop;

		return intParse || intParse === undefined ? parseInt(row, 10) : row;
	},

	/**
	 * Calculate the pixel position from the top of the scrolling container for
	 * a given row
	 *  @param {int} iRow Row number to calculate the position of
	 *  @returns {int} Pixels
	 */
	rowToPixels: function (rowIdx, intParse, virtual) {
		var pixels;
		var diff = rowIdx - this.s.baseRowTop;

		if (virtual) {
			pixels = this._domain('virtualToPhysical', this.s.baseScrollTop);
			pixels += diff * this.s.heights.row;
		}
		else {
			pixels = this.s.baseScrollTop;
			pixels += diff * this.s.heights.row;
		}

		return intParse || intParse === undefined
			? parseInt(pixels, 10)
			: pixels;
	},

	/**
	 * Calculate the row number that will be found at the given pixel position (y-scroll)
	 *  @param {int} row Row index to scroll to
	 *  @param {bool} [animate=true] Animate the transition or not
	 *  @returns {void}
	 */
	scrollToRow: function (row, animate) {
		var that = this;
		var ani = false;
		var px = this.rowToPixels(row);

		// We need to know if the table will redraw or not before doing the
		// scroll. If it will not redraw, then we need to use the currently
		// displayed table, and scroll with the physical pixels. Otherwise, we
		// need to calculate the table's new position from the virtual
		// transform.
		var preRows = ((this.s.displayBuffer - 1) / 2) * this.s.viewportRows;
		var drawRow = row - preRows;
		if (drawRow < 0) {
			drawRow = 0;
		}

		if (
			(px > this.s.redrawBottom || px < this.s.redrawTop) &&
			this.s.dt._iDisplayStart !== drawRow
		) {
			ani = true;
			px = this._domain('virtualToPhysical', row * this.s.heights.row);

			// If we need records outside the current draw region, but the new
			// scrolling position is inside that (due to the non-linear nature
			// for larger numbers of records), we need to force position update.
			if (this.s.redrawTop < px && px < this.s.redrawBottom) {
				this.s.forceReposition = true;
				animate = false;
			}
		}

		if (animate === undefined || animate) {
			this.s.ani = ani;
			$(this.dom.scroller).animate(
				{
					scrollTop: px
				},
				function () {
					// This needs to happen after the animation has completed and
					// the final scroll event fired
					setTimeout(function () {
						that.s.ani = false;
					}, 250);
				}
			);
		}
		else {
			$(this.dom.scroller).scrollTop(px);
		}
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialisation for Scroller
	 *  @returns {void}
	 *  @private
	 */
	construct: function () {
		var that = this;
		var dt = this.s.dtApi;

		/* Sanity check */
		if (!this.s.dt.oFeatures.bPaginate) {
			throw new Error(
				'Pagination must be enabled for Scroller to operate'
			);
		}

		/* Insert a div element that we can use to force the DT scrolling container to
		 * the height that would be required if the whole table was being displayed
		 */
		this.dom.force.style.position = 'relative';
		this.dom.force.style.top = '0px';
		this.dom.force.style.left = '0px';
		this.dom.force.style.width = '1px';

		this.dom.scroller = dt.table().node().parentNode;
		this.dom.scroller.appendChild(this.dom.force);
		this.dom.scroller.style.position = 'relative';

		this.dom.table = $('>table', this.dom.scroller)[0];
		this.dom.table.style.position = 'absolute';
		this.dom.table.style.top = '0px';
		this.dom.table.style.left = '0px';

		// Add class to 'announce' that we are a Scroller table
		$(dt.table().container()).addClass('dts DTS');

		this.dom.label.appendTo(this.dom.scroller);

		/* Initial size calculations */
		if (this.s.heights.row && this.s.heights.row != 'auto') {
			this.s.autoHeight = false;
		}

		// Scrolling callback to see if a page change is needed
		this.s.ingnoreScroll = true;
		$(this.dom.scroller).on('scroll.dt-scroller', function (e) {
			that._scroll.call(that);
		});

		// In iOS we catch the touchstart event in case the user tries to scroll
		// while the display is already scrolling
		$(this.dom.scroller).on('touchstart.dt-scroller', function () {
			that._scroll.call(that);
		});

		$(this.dom.scroller)
			.on('mousedown.dt-scroller', function () {
				that.s.mousedown = true;
			})
			.on('mouseup.dt-scroller', function () {
				that.s.labelVisible = false;
				that.s.mousedown = false;
				that.dom.label.css('display', 'none');
			});

		// On resize, update the information element, since the number of rows shown might change
		$(window).on('resize.dt-scroller', function () {
			that.measure(false);
			that._info();
		});

		// Add a state saving parameter to the DT state saving so we can restore the exact
		// position of the scrolling.
		var initialStateSave = true;
		var loadedState = dt.state.loaded();

		dt.on('stateSaveParams.scroller', function (e, settings, data) {
			if (initialStateSave && loadedState) {
				data.scroller = loadedState.scroller;
				initialStateSave = false;

				if (data.scroller) {
					that.s.lastScrollTop = data.scroller.scrollTop;
				}
			}
			else {
				// Need to used the saved position on init
				data.scroller = {
					topRow: that.s.topRowFloat,
					baseRowTop: that.s.baseRowTop
				};
			}
		});

		dt.on('stateLoadParams.scroller', function (e, settings, data) {
			if (data.scroller !== undefined) {
				that.scrollToRow(data.scroller.topRow);
			}
		});

		this.measure(false);

		if (loadedState && loadedState.scroller) {
			this.s.topRowFloat = loadedState.scroller.topRow;
			this.s.baseRowTop = loadedState.scroller.baseRowTop;

			// Reconstruct the scroll positions from the rows - it is possible the
			// row height has changed e.g. if the styling framework has changed.
			// The scroll top is used in `_draw` further down.
			this.s.baseScrollTop = this.s.baseRowTop * this.s.heights.row;			
			loadedState.scroller.scrollTop = this._domain('physicalToVirtual', this.s.topRowFloat * this.s.heights.row);
		}

		that.s.stateSaveThrottle = DataTable.util.throttle(function () {
			that.s.dtApi.state.save();
		}, 500);

		dt.on('init.scroller', function () {
			that.measure(false);

			// Setting to `jump` will instruct _draw to calculate the scroll top
			// position
			that.s.scrollType = 'jump';
			that._draw();

			// Update the scroller when the DataTable is redrawn
			dt.on('draw.scroller', function () {
				that._draw();
			});
		});

		// Set height before the draw happens, allowing everything else to update
		// on draw complete without worry for roder.
		dt.on('preDraw.dt.scroller', function () {
			that._scrollForce();
		});

		// Destructor
		dt.on('destroy.scroller', function () {
			$(window).off('resize.dt-scroller');
			$(that.dom.scroller).off('.dt-scroller');
			$(that.s.dt.nTable).off('.scroller');

			$(that.s.dt.nTableWrapper).removeClass('DTS');
			$('div.DTS_Loading', that.dom.scroller.parentNode).remove();

			that.dom.table.style.position = '';
			that.dom.table.style.top = '';
			that.dom.table.style.left = '';
		});
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Automatic calculation of table row height. This is just a little tricky here as using
	 * initialisation DataTables has tale the table out of the document, so we need to create
	 * a new table and insert it into the document, calculate the row height and then whip the
	 * table out.
	 *  @returns {void}
	 *  @private
	 */
	_calcRowHeight: function () {
		var dt = this.s.dt;
		var origTable = dt.nTable;
		var nTable = origTable.cloneNode(false);
		var tbody = $('<tbody/>').appendTo(nTable);
		var dtClasses = dt.oClasses;

		// Different locations for classes in DT2
		var classes = DataTable.versionCheck('2')
			? {
					container: dtClasses.container,
					scroller: dtClasses.scrolling.container,
					body: dtClasses.scrolling.body
			}
			: {
					container: dtClasses.sWrapper,
					scroller: dtClasses.sScrollWrapper,
					body: dtClasses.sScrollBody
			};

		var container = $(
			'<div class="' +
				classes.container +
				' DTS"><div class="' +
				classes.scroller +
				'"><div class="' +
				classes.body +
				'"></div></div></div>'
		);

		// Want 3 rows in the sizing table so :first-child and :last-child
		// CSS styles don't come into play - take the size of the middle row
		$('tbody tr:lt(4)', origTable).clone().appendTo(tbody);
		var rowsCount = $('tr', tbody).length;

		if (rowsCount === 1) {
			tbody.prepend('<tr><td>&#160;</td></tr>');
			tbody.append('<tr><td>&#160;</td></tr>');
		}
		else {
			for (; rowsCount < 3; rowsCount++) {
				tbody.append('<tr><td>&#160;</td></tr>');
			}
		}

		$('div.' + classes.body, container).append(nTable);

		// If initialised using `dom`, use the holding element as the insert point
		var insertEl = this.s.dt.nHolding || origTable.parentNode;

		if (!$(insertEl).is(':visible')) {
			insertEl = 'body';
		}

		// Remove form element links as they might select over others (particularly radio and checkboxes)
		container.find('input').removeAttr('name');

		container.appendTo(insertEl);
		this.s.heights.row = $('tr', tbody).eq(1).outerHeight();

		container.remove();
	},

	/**
	 * Draw callback function which is fired when the DataTable is redrawn. The main function of
	 * this method is to position the drawn table correctly the scrolling container for the rows
	 * that is displays as a result of the scrolling position.
	 *  @returns {void}
	 *  @private
	 */
	_draw: function () {
		var that = this,
			heights = this.s.heights,
			iScrollTop = this.dom.scroller.scrollTop,
			iTableHeight = $(this.s.dt.nTable).height(),
			displayStart = this.s.dt._iDisplayStart,
			displayLen = this.s.dt._iDisplayLength,
			displayEnd = this.s.dt.fnRecordsDisplay(),
			viewportEndY = iScrollTop + heights.viewport;

		// Disable the scroll event listener while we are updating the DOM
		this.s.skip = true;

		// If paging is reset
		if (
			(this.s.dt.bSorted || this.s.dt.bFiltered) &&
			displayStart === 0 &&
			!this.s.dt._drawHold
		) {
			this.s.topRowFloat = 0;
		}

		iScrollTop =
			this.s.scrollType === 'jump'
				? this._domain(
					'virtualToPhysical',
					this.s.topRowFloat * heights.row
				)
				: iScrollTop;

		// Store positional information so positional calculations can be based
		// upon the current table draw position
		this.s.baseScrollTop = iScrollTop;
		this.s.baseRowTop = this.s.topRowFloat;

		// Position the table in the virtual scroller
		var tableTop =
			iScrollTop - (this.s.topRowFloat - displayStart) * heights.row;
		if (displayStart === 0) {
			tableTop = 0;
		}
		else if (displayStart + displayLen >= displayEnd) {
			tableTop = heights.scroll - iTableHeight;
		}
		else {
			var iTableBottomY = tableTop + iTableHeight;
			if (iTableBottomY < viewportEndY) {
				// The last row of the data is above the end of the viewport.
				// This means the background is visible, which is not what the user expects.
				var newTableTop = viewportEndY - iTableHeight;
				var diffPx = newTableTop - tableTop;
				this.s.baseScrollTop += diffPx + 1; // Update start row number in footer.
				tableTop = newTableTop; // Move table so last line of data is at the bottom of the viewport.
			}
		}

		this.dom.table.style.top = tableTop + 'px';

		/* Cache some information for the scroller */
		this.s.tableTop = tableTop;
		this.s.tableBottom = iTableHeight + this.s.tableTop;

		// Calculate the boundaries for where a redraw will be triggered by the
		// scroll event listener
		var boundaryPx = (iScrollTop - this.s.tableTop) * this.s.boundaryScale;
		this.s.redrawTop = iScrollTop - boundaryPx;
		this.s.redrawBottom =
			iScrollTop + boundaryPx >
			heights.scroll - heights.viewport - heights.row
				? heights.scroll - heights.viewport - heights.row
				: iScrollTop + boundaryPx;

		this.s.skip = false;

		if (that.s.ingnoreScroll) {
			// Restore the scrolling position that was saved by DataTable's state
			// saving Note that this is done on the second draw when data is Ajax
			// sourced, and the first draw when DOM soured
			if (
				this.s.dt.oFeatures.bStateSave &&
				this.s.dt.oLoadedState !== null &&
				typeof this.s.dt.oLoadedState.scroller != 'undefined'
			) {
				// A quirk of DataTables is that the draw callback will occur on an
				// empty set if Ajax sourced, but not if server-side processing.
				var ajaxSourced =
					(this.s.dt.sAjaxSource || that.s.dt.ajax) &&
					!this.s.dt.oFeatures.bServerSide
						? true
						: false;

				if (
					(ajaxSourced && this.s.dt.iDraw >= 2) ||
					(!ajaxSourced && this.s.dt.iDraw >= 1)
				) {
					setTimeout(function () {
						$(that.dom.scroller).scrollTop(
							that.s.dt.oLoadedState.scroller.scrollTop
						);

						// In order to prevent layout thrashing we need another
						// small delay
						setTimeout(function () {
							that.s.ingnoreScroll = false;
						}, 0);
					}, 0);
				}
			}
			else {
				that.s.ingnoreScroll = false;
			}
		}

		// Because of the order of the DT callbacks, the info update will
		// take precedence over the one we want here. So a 'thread' break is
		// needed.  Only add the thread break if bInfo is set
		if (this.s.dt.oFeatures.bInfo) {
			setTimeout(function () {
				that._info.call(that);
			}, 0);
		}

		$(this.s.dt.nTable).triggerHandler('position.dts.dt', tableTop);
	},

	/**
	 * Convert from one domain to another. The physical domain is the actual
	 * pixel count on the screen, while the virtual is if we had browsers which
	 * had scrolling containers of infinite height (i.e. the absolute value)
	 *
	 *  @param {string} dir Domain transform direction, `virtualToPhysical` or
	 *    `physicalToVirtual`
	 *  @returns {number} Calculated transform
	 *  @private
	 */
	_domain: function (dir, val) {
		var heights = this.s.heights;
		var diff;
		var magic = 10000; // the point at which the non-linear calculations start to happen

		// If the virtual and physical height match, then we use a linear
		// transform between the two, allowing the scrollbar to be linear
		if (heights.virtual === heights.scroll) {
			return val;
		}

		// In the first 10k pixels and the last 10k pixels, we want the scrolling
		// to be linear. After that it can be non-linear. It would be unusual for
		// anyone to mouse wheel through that much.
		if (val < magic) {
			return val;
		}
		else if (
			dir === 'virtualToPhysical' &&
			val >= heights.virtual - magic
		) {
			diff = heights.virtual - val;
			return heights.scroll - diff;
		}
		else if (dir === 'physicalToVirtual' && val >= heights.scroll - magic) {
			diff = heights.scroll - val;
			return heights.virtual - diff;
		}

		// Otherwise, we want a non-linear scrollbar to take account of the
		// redrawing regions at the start and end of the table, otherwise these
		// can stutter badly - on large tables 30px (for example) scroll might
		// be hundreds of rows, so the table would be redrawing every few px at
		// the start and end. Use a simple linear eq. to stop this, effectively
		// causing a kink in the scrolling ratio. It does mean the scrollbar is
		// non-linear, but with such massive data sets, the scrollbar is going
		// to be a best guess anyway
		var m =
			(heights.virtual - magic - magic) /
			(heights.scroll - magic - magic);
		var c = magic - m * magic;

		return dir === 'virtualToPhysical' ? (val - c) / m : m * val + c;
	},

	/**
	 * Update any information elements that are controlled by the DataTable based on the scrolling
	 * viewport and what rows are visible in it. This function basically acts in the same way as
	 * _fnUpdateInfo in DataTables, and effectively replaces that function.
	 *  @returns {void}
	 *  @private
	 */
	_info: function () {
		if (!this.s.dt.oFeatures.bInfo) {
			return;
		}

		var dt = this.s.dt,
			dtApi = this.s.dtApi,
			language = dt.oLanguage,
			info = dtApi.page.info(),
			total = info.recordsDisplay,
			max = info.recordsTotal;

		// If the scroll type is `cont` (continuous) we need to use `baseRowTop`, which
		// also means we need to work out the difference between the current scroll position
		// and the "base" for when it was required
		var diffRows = (this.s.lastScrollTop - this.s.baseScrollTop) / this.s.heights.row;
		var start = Math.floor(this.s.baseRowTop + diffRows) + 1;

		// For a jump scroll type, we just use the straightforward calculation based on
		// `topRowFloat`
		if (this.s.scrollType === 'jump') {
			start = Math.floor(this.s.topRowFloat) + 1;
		}

		var
			possibleEnd = start + Math.floor(this.s.heights.viewport / this.s.heights.row),
			end = possibleEnd > total ? total : possibleEnd,
			result;

		if (total === 0 && total == max) {
			/* Empty record set */
			result = language.sInfoEmpty + language.sInfoPostFix;
		}
		else if (total === 0) {
			// Empty record set after filtering
			result =
				language.sInfoEmpty +
				' ' +
				language.sInfoFiltered +
				language.sInfoPostFix;
		}
		else if (total == max) {
			// Normal record set
			result = language.sInfo + language.sInfoPostFix;
		}
		else {
			// Record set after filtering
			result = language.sInfo + ' ' + language.sInfoFiltered + language.sInfoPostFix;
		}

		result = this._macros(result, start, end, max, total);

		var callback = language.fnInfoCallback;
		if (callback) {
			result = callback.call(
				dt.oInstance,
				dt,
				start,
				end,
				max,
				total,
				result
			);
		}

		// DT 1.x features
		var n = dt.aanFeatures.i;
		if (typeof n != 'undefined') {
			for (var i = 0, iLen = n.length; i < iLen; i++) {
				$(n[i]).html(result);
			}

			$(dt.nTable).triggerHandler('info.dt');
		}

		// DT 2.x features
		$('div.dt-info', dtApi.table().container()).each(function () {
			$(this).html(result);
			dtApi.trigger('info', [dtApi.settings()[0], this, result]);
		});
	},

	/**
	 * String replacement for info display. Basically the same as what DataTables does.
	 *
	 * @param {*} str
	 * @param {*} start
	 * @param {*} end
	 * @param {*} max
	 * @param {*} total
	 * @returns Formatted string
	 */
	_macros: function (str, start, end, max, total) {
		var api = this.s.dtApi;
		var settings = this.s.dt;
		var formatter = settings.fnFormatNumber;

		return str
			.replace(/_START_/g, formatter.call(settings, start))
			.replace(/_END_/g, formatter.call(settings, end))
			.replace(/_MAX_/g, formatter.call(settings, max))
			.replace(/_TOTAL_/g, formatter.call(settings, total))
			.replace(/_ENTRIES_/g, api.i18n('entries', ''))
			.replace(/_ENTRIES-MAX_/g, api.i18n('entries', '', max))
			.replace(/_ENTRIES-TOTAL_/g, api.i18n('entries', '', total));
	},

	/**
	 * Parse CSS height property string as number
	 *
	 * An attempt is made to parse the string as a number. Currently supported units are 'px',
	 * 'vh', and 'rem'. 'em' is partially supported; it works as long as the parent element's
	 * font size matches the body element. Zero is returned for unrecognized strings.
	 *  @param {string} cssHeight CSS height property string
	 *  @returns {number} height
	 *  @private
	 */
	_parseHeight: function (cssHeight) {
		var height;
		var matches = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(px|em|rem|vh)$/.exec(
			cssHeight
		);

		if (matches === null) {
			return 0;
		}

		var value = parseFloat(matches[1]);
		var unit = matches[2];

		if (unit === 'px') {
			height = value;
		}
		else if (unit === 'vh') {
			height = (value / 100) * $(window).height();
		}
		else if (unit === 'rem') {
			height = value * parseFloat($(':root').css('font-size'));
		}
		else if (unit === 'em') {
			height = value * parseFloat($('body').css('font-size'));
		}

		return height ? height : 0;
	},

	/**
	 * Scrolling function - fired whenever the scrolling position is changed.
	 * This method needs to use the stored values to see if the table should be
	 * redrawn as we are moving towards the end of the information that is
	 * currently drawn or not. If needed, then it will redraw the table based on
	 * the new position.
	 *  @returns {void}
	 *  @private
	 */
	_scroll: function () {
		var that = this,
			heights = this.s.heights,
			iScrollTop = this.dom.scroller.scrollTop,
			iTopRow;

		if (this.s.skip) {
			return;
		}

		if (this.s.ingnoreScroll) {
			return;
		}

		if (iScrollTop === this.s.lastScrollTop) {
			return;
		}

		/* If the table has been sorted or filtered, then we use the redraw that
		 * DataTables as done, rather than performing our own
		 */
		if (this.s.dt.bFiltered || this.s.dt.bSorted) {
			this.s.lastScrollTop = 0;
			return;
		}

		/* We don't want to state save on every scroll event - that's heavy
		 * handed, so use a timeout to update the state saving only when the
		 * scrolling has finished
		 */
		clearTimeout(this.s.stateTO);
		this.s.stateTO = setTimeout(function () {
			that.s.dtApi.state.save();

			// We can also use this to ensure that the `info` element is correct
			// since there can be a little scroll after the last scroll event!
			that._info();
		}, 250);

		this.s.scrollType =
			Math.abs(iScrollTop - this.s.lastScrollTop) > heights.viewport
				? 'jump'
				: 'cont';

		this.s.topRowFloat =
			this.s.scrollType === 'cont'
				? this.pixelsToRow(iScrollTop, false, false)
				: this._domain('physicalToVirtual', iScrollTop) / heights.row;

		if (this.s.topRowFloat < 0) {
			this.s.topRowFloat = 0;
		}

		/* Check if the scroll point is outside the trigger boundary which would required
		 * a DataTables redraw
		 */
		if (
			this.s.forceReposition ||
			iScrollTop < this.s.redrawTop ||
			iScrollTop > this.s.redrawBottom
		) {
			var preRows = Math.ceil(
				((this.s.displayBuffer - 1) / 2) * this.s.viewportRows
			);

			iTopRow = parseInt(this.s.topRowFloat, 10) - preRows;
			this.s.forceReposition = false;

			if (iTopRow <= 0) {
				/* At the start of the table */
				iTopRow = 0;
			}
			else if (
				iTopRow + this.s.dt._iDisplayLength >
				this.s.dt.fnRecordsDisplay()
			) {
				/* At the end of the table */
				iTopRow =
					this.s.dt.fnRecordsDisplay() - this.s.dt._iDisplayLength;
				if (iTopRow < 0) {
					iTopRow = 0;
				}
			}
			else if (iTopRow % 2 !== 0) {
				// For the row-striping classes (odd/even) we want only to start
				// on evens otherwise the stripes will change between draws and
				// look rubbish
				iTopRow++;
			}

			// Store calcuated value, in case the following condition is not met, but so
			// that the draw function will still use it.
			this.s.targetTop = iTopRow;

			if (iTopRow != this.s.dt._iDisplayStart) {
				/* Cache the new table position for quick lookups */
				this.s.tableTop = $(this.s.dt.nTable).offset().top;
				this.s.tableBottom =
					$(this.s.dt.nTable).height() + this.s.tableTop;

				var draw = function () {
					that.s.dt._iDisplayStart = that.s.targetTop;
					that.s.dtApi.draw('page');
				};

				/* Do the DataTables redraw based on the calculated start point - note that when
				 * using server-side processing we introduce a small delay to not DoS the server...
				 */
				if (this.s.dt.oFeatures.bServerSide) {
					this.s.forceReposition = true;

					// This is used only for KeyTable and is not currently publicly
					// documented. Open question - is it useful for anything else?
					$(this.s.dt.nTable).triggerHandler('scroller-will-draw.dt');

					if (DataTable.versionCheck('2')) {
						that.s.dtApi.processing(true);
					}
					else {
						this.s.dt.oApi._fnProcessingDisplay(this.s.dt, true);
					}

					clearTimeout(this.s.drawTO);
					this.s.drawTO = setTimeout(draw, this.s.serverWait);
				}
				else {
					draw();
				}
			}
		}
		else {
			this.s.topRowFloat = this.pixelsToRow(iScrollTop, false, true);
		}

		/* Update the table's information display for what is now in the viewport */
		this._info();

		this.s.lastScrollTop = iScrollTop;
		this.s.stateSaveThrottle();

		if (this.s.scrollType === 'jump' && this.s.mousedown) {
			this.s.labelVisible = true;
		}
		if (this.s.labelVisible) {
			var labelFactor =
				(heights.viewport - heights.labelHeight - heights.xbar) /
				heights.scroll;

			this.dom.label
				.html(
					this.s.dt.fnFormatNumber(
						parseInt(this.s.topRowFloat, 10) + 1
					)
				)
				.css('top', iScrollTop + iScrollTop * labelFactor)
				.css('display', 'block');
		}
	},

	/**
	 * Force the scrolling container to have height beyond that of just the
	 * table that has been drawn so the user can scroll the whole data set.
	 *
	 * Note that if the calculated required scrolling height exceeds a maximum
	 * value (1 million pixels - hard-coded) the forcing element will be set
	 * only to that maximum value and virtual / physical domain transforms will
	 * be used to allow Scroller to display tables of any number of records.
	 *  @returns {void}
	 *  @private
	 */
	_scrollForce: function () {
		var heights = this.s.heights;
		var max = 1000000;

		heights.virtual = heights.row * this.s.dt.fnRecordsDisplay();
		heights.scroll = heights.virtual;

		if (heights.scroll > max) {
			heights.scroll = max;
		}

		// Minimum height so there is always a row visible (the 'no rows found'
		// if reduced to zero filtering)
		this.dom.force.style.height =
			heights.scroll > this.s.heights.row
				? heights.scroll + 'px'
				: this.s.heights.row + 'px';
	}
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Scroller default settings for initialisation
 *  @namespace
 *  @name Scroller.defaults
 *  @static
 */
Scroller.defaults = {
	/**
	 * Scroller uses the boundary scaling factor to decide when to redraw the table - which it
	 * typically does before you reach the end of the currently loaded data set (in order to
	 * allow the data to look continuous to a user scrolling through the data). If given as 0
	 * then the table will be redrawn whenever the viewport is scrolled, while 1 would not
	 * redraw the table until the currently loaded data has all been shown. You will want
	 * something in the middle - the default factor of 0.5 is usually suitable.
	 *  @type     float
	 *  @default  0.5
	 *  @static
	 */
	boundaryScale: 0.5,

	/**
	 * The display buffer is what Scroller uses to calculate how many rows it should pre-fetch
	 * for scrolling. Scroller automatically adjusts DataTables' display length to pre-fetch
	 * rows that will be shown in "near scrolling" (i.e. just beyond the current display area).
	 * The value is based upon the number of rows that can be displayed in the viewport (i.e.
	 * a value of 1), and will apply the display range to records before before and after the
	 * current viewport - i.e. a factor of 3 will allow Scroller to pre-fetch 1 viewport's worth
	 * of rows before the current viewport, the current viewport's rows and 1 viewport's worth
	 * of rows after the current viewport. Adjusting this value can be useful for ensuring
	 * smooth scrolling based on your data set.
	 *  @type     int
	 *  @default  9
	 *  @static
	 */
	displayBuffer: 9,

	/**
	 * Scroller will attempt to automatically calculate the height of rows for it's internal
	 * calculations. However the height that is used can be overridden using this parameter.
	 *  @type     int|string
	 *  @default  auto
	 *  @static
	 */
	rowHeight: 'auto',

	/**
	 * When using server-side processing, Scroller will wait a small amount of time to allow
	 * the scrolling to finish before requesting more data from the server. This prevents
	 * you from DoSing your own server! The wait time can be configured by this parameter.
	 *  @type     int
	 *  @default  200
	 *  @static
	 */
	serverWait: 200
};

Scroller.oDefaults = Scroller.defaults;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Scroller version
 *  @type      String
 *  @default   See code
 *  @name      Scroller.version
 *  @static
 */
Scroller.version = '2.4.3';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialisation
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on('preInit.dt.dtscroller', function (e, settings) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.oInit.scroller;
	var defaults = DataTable.defaults.scroller;

	if (init || defaults) {
		var opts = $.extend({}, init, defaults);

		if (init !== false) {
			new Scroller(settings, opts);
		}
	}
});

// Attach Scroller to DataTables so it can be accessed as an 'extra'
$.fn.dataTable.Scroller = Scroller;
$.fn.DataTable.Scroller = Scroller;

// DataTables 1.10 API method aliases
var Api = $.fn.dataTable.Api;

Api.register('scroller()', function () {
	return this;
});

// Undocumented and deprecated - is it actually useful at all?
Api.register('scroller().rowToPixels()', function (rowIdx, intParse, virtual) {
	var ctx = this.context;

	if (ctx.length && ctx[0].oScroller) {
		return ctx[0].oScroller.rowToPixels(rowIdx, intParse, virtual);
	}
	// undefined
});

// Undocumented and deprecated - is it actually useful at all?
Api.register('scroller().pixelsToRow()', function (pixels, intParse, virtual) {
	var ctx = this.context;

	if (ctx.length && ctx[0].oScroller) {
		return ctx[0].oScroller.pixelsToRow(pixels, intParse, virtual);
	}
	// undefined
});

// `scroller().scrollToRow()` is undocumented and deprecated. Use `scroller.toPosition()
Api.register(
	['scroller().scrollToRow()', 'scroller.toPosition()'],
	function (idx, ani) {
		this.iterator('table', function (ctx) {
			if (ctx.oScroller) {
				ctx.oScroller.scrollToRow(idx, ani);
			}
		});

		return this;
	}
);

Api.register('row().scrollTo()', function (ani) {
	var that = this;

	this.iterator('row', function (ctx, rowIdx) {
		if (ctx.oScroller) {
			var displayIdx = that
				.rows({ order: 'applied', search: 'applied' })
				.indexes()
				.indexOf(rowIdx);

			ctx.oScroller.scrollToRow(displayIdx, ani);
		}
	});

	return this;
});

Api.register('scroller.measure()', function (redraw) {
	this.iterator('table', function (ctx) {
		if (ctx.oScroller) {
			ctx.oScroller.measure(redraw);
		}
	});

	return this;
});

Api.register('scroller.page()', function () {
	var ctx = this.context;

	if (ctx.length && ctx[0].oScroller) {
		return ctx[0].oScroller.pageInfo();
	}
	// undefined
});


return DataTable;
}));


/*! Select for DataTables 3.0.0
 * © SpryMedia Ltd - datatables.net/license/mit
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



// Version information for debugger
DataTable.select = {};

DataTable.select.classes = {
	checkbox: 'dt-select-checkbox'
};

DataTable.select.version = '3.0.0';

DataTable.select.init = function (dt) {
	var ctx = dt.settings()[0];

	if (!DataTable.versionCheck('2')) {
		throw 'Warning: Select requires DataTables 2 or newer';
	}

	if (ctx._select) {
		return;
	}

	var savedSelected = dt.state.loaded();

	var selectAndSave = function (e, settings, data) {
		if (data === null || data.select === undefined) {
			return;
		}

		// Clear any currently selected rows, before restoring state
		// None will be selected on first initialisation
		if (dt.rows({ selected: true }).any()) {
			dt.rows().deselect();
		}
		if (data.select.rows !== undefined) {
			dt.rows(data.select.rows).select();
		}

		if (dt.columns({ selected: true }).any()) {
			dt.columns().deselect();
		}
		if (data.select.columns !== undefined) {
			dt.columns(data.select.columns).select();
		}

		if (dt.cells({ selected: true }).any()) {
			dt.cells().deselect();
		}
		if (data.select.cells !== undefined) {
			for (var i = 0; i < data.select.cells.length; i++) {
				dt.cell(data.select.cells[i].row, data.select.cells[i].column).select();
			}
		}

		dt.state.save();
	};

	dt.on('stateSaveParams', function (e, settings, data) {
		data.select = {};
		data.select.rows = dt.rows({ selected: true }).ids(true).toArray();
		data.select.columns = dt.columns({ selected: true })[0];
		data.select.cells = dt.cells({ selected: true })[0].map(function (coords) {
			return { row: dt.row(coords.row).id(true), column: coords.column };
		});
	})
		.on('stateLoadParams', selectAndSave)
		.one('init', function () {
			selectAndSave(undefined, undefined, savedSelected);
		});

	var init = ctx.oInit.select;
	var defaults = DataTable.defaults.select;
	var opts = init === undefined ? defaults : init;

	// Set defaults
	var items = 'row';
	var style = 'api';
	var blurable = false;
	var toggleable = true;
	var selectable = null;
	var info = true;
	var selector = 'td, th';
	var className = 'selected';
	var headerCheckbox = true;
	var setStyle = false;
	var keys = false;

	ctx._select = {
		infoEls: []
	};

	// Initialisation customisations
	if (opts === true) {
		style = 'os';
		setStyle = true;
	}
	else if (typeof opts === 'string') {
		style = opts;
		setStyle = true;
	}
	else if ($.isPlainObject(opts)) {
		if (opts.blurable !== undefined) {
			blurable = opts.blurable;
		}

		if (opts.toggleable !== undefined) {
			toggleable = opts.toggleable;
		}

		if (opts.info !== undefined) {
			info = opts.info;
		}

		if (opts.items !== undefined) {
			items = opts.items;
		}

		if (opts.style !== undefined) {
			style = opts.style;
			setStyle = true;
		}
		else {
			style = 'os';
			setStyle = true;
		}

		if (opts.selector !== undefined) {
			selector = opts.selector;
		}

		if (opts.className !== undefined) {
			className = opts.className;
		}

		if (opts.headerCheckbox !== undefined) {
			headerCheckbox = opts.headerCheckbox;
		}

		if (opts.selectable !== undefined) {
			selectable = opts.selectable;
		}

		if (opts.keys !== undefined) {
			keys = opts.keys;
		}
	}

	dt.select.selector(selector);
	dt.select.items(items);
	dt.select.style(style);
	dt.select.blurable(blurable);
	dt.select.toggleable(toggleable);
	dt.select.info(info);
	dt.select.keys(keys);
	dt.select.selectable(selectable);
	ctx._select.className = className;

	// If the init options haven't enabled select, but there is a selectable
	// class name, then enable
	if (!setStyle && $(dt.table().node()).hasClass('selectable')) {
		dt.select.style('os');
	}

	// Insert a checkbox into the header if needed - might need to wait
	// for init complete
	if (headerCheckbox || headerCheckbox === 'select-page' || headerCheckbox === 'select-all') {
		dt.ready(function () {
			initCheckboxHeader(dt, headerCheckbox);
		});
	}
};

/*

Select is a collection of API methods, event handlers, event emitters and
buttons (for the `Buttons` extension) for DataTables. It provides the following
features, with an overview of how they are implemented:

## Selection of rows, columns and cells. Whether an item is selected or not is
   stored in:

* rows: a `_select_selected` property which contains a boolean value of the
  DataTables' `aoData` object for each row
* columns: a `_select_selected` property which contains a boolean value of the
  DataTables' `aoColumns` object for each column
* cells: a `_selected_cells` property which contains an array of boolean values
  of the `aoData` object for each row. The array is the same length as the
  columns array, with each element of it representing a cell.

This method of using boolean flags allows Select to operate when nodes have not
been created for rows / cells (DataTables' defer rendering feature).

## API methods

A range of API methods are available for triggering selection and de-selection
of rows. Methods are also available to configure the selection events that can
be triggered by an end user (such as which items are to be selected). To a large
extent, these of API methods *is* Select. It is basically a collection of helper
functions that can be used to select items in a DataTable.

Configuration of select is held in the object `_select` which is attached to the
DataTables settings object on initialisation. Select being available on a table
is not optional when Select is loaded, but its default is for selection only to
be available via the API - so the end user wouldn't be able to select rows
without additional configuration.

The `_select` object contains the following properties:

```
{
	items:string       - Can be `rows`, `columns` or `cells`. Defines what item 
	                     will be selected if the user is allowed to activate row
	                     selection using the mouse.
	style:string       - Can be `none`, `single`, `multi` or `os`. Defines the
	                     interaction style when selecting items
	blurable:boolean   - If row selection can be cleared by clicking outside of
	                     the table
	toggleable:boolean - If row selection can be cancelled by repeated clicking
	                     on the row
	info:boolean       - If the selection summary should be shown in the table
	                     information elements
	infoEls:element[]  - List of HTML elements with info elements for a table
}
```

In addition to the API methods, Select also extends the DataTables selector
options for rows, columns and cells adding a `selected` option to the selector
options object, allowing the developer to select only selected items or
unselected items.

## Mouse selection of items

Clicking on items can be used to select items. This is done by a simple event
handler that will select the items using the API methods.

 */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local functions
 */

/**
 * Add one or more cells to the selection when shift clicking in OS selection
 * style cell selection.
 *
 * Cell range is more complicated than row and column as we want to select
 * in the visible grid rather than by index in sequence. For example, if you
 * click first in cell 1-1 and then shift click in 2-2 - cells 1-2 and 2-1
 * should also be selected (and not 1-3, 1-4. etc)
 *
 * @param  {DataTable.Api} dt   DataTable
 * @param  {object}        idx  Cell index to select to
 * @param  {object}        last Cell index to select from
 * @private
 */
function cellRange(dt, idx, last) {
	var indexes;
	var columnIndexes;
	var rowIndexes;
	var selectColumns = function (start, end) {
		if (start > end) {
			var tmp = end;
			end = start;
			start = tmp;
		}

		var record = false;
		return dt
			.columns(':visible')
			.indexes()
			.filter(function (i) {
				if (i === start) {
					record = true;
				}

				if (i === end) {
					// not else if, as start might === end
					record = false;
					return true;
				}

				return record;
			});
	};

	var selectRows = function (start, end) {
		var indexes = dt.rows({ search: 'applied' }).indexes();

		// Which comes first - might need to swap
		if (indexes.indexOf(start) > indexes.indexOf(end)) {
			var tmp = end;
			end = start;
			start = tmp;
		}

		var record = false;
		return indexes.filter(function (i) {
			if (i === start) {
				record = true;
			}

			if (i === end) {
				record = false;
				return true;
			}

			return record;
		});
	};

	if (!dt.cells({ selected: true }).any() && !last) {
		// select from the top left cell to this one
		columnIndexes = selectColumns(0, idx.column);
		rowIndexes = selectRows(0, idx.row);
	}
	else {
		// Get column indexes between old and new
		columnIndexes = selectColumns(last.column, idx.column);
		rowIndexes = selectRows(last.row, idx.row);
	}

	indexes = dt.cells(rowIndexes, columnIndexes).flatten();

	if (!dt.cells(idx, { selected: true }).any()) {
		// Select range
		dt.cells(indexes).select();
	}
	else {
		// Deselect range
		dt.cells(indexes).deselect();
	}
}

/**
 * Get the class
 * @returns 
 */
function checkboxClass(selector) {
	var name = DataTable.select.classes.checkbox;

	return selector
		? name.replace(/ /g, '.')
		: name;
}

/**
 * Disable mouse selection by removing the selectors
 *
 * @param {DataTable.Api} dt DataTable to remove events from
 * @private
 */
function disableMouseSelection(dt) {
	var ctx = dt.settings()[0];
	var selector = ctx._select.selector;

	$(dt.table().container())
		.off('mousedown.dtSelect', selector)
		.off('mouseup.dtSelect', selector)
		.off('click.dtSelect', selector);

	$('body').off('click.dtSelect' + _safeId(dt.table().node()));
}

/**
 * Attach mouse listeners to the table to allow mouse selection of items
 *
 * @param {DataTable.Api} dt DataTable to remove events from
 * @private
 */
function enableMouseSelection(dt) {
	var container = $(dt.table().container());
	var ctx = dt.settings()[0];
	var selector = ctx._select.selector;
	var matchSelection;

	container
		.on('mousedown.dtSelect', selector, function (e) {
			// Disallow text selection for shift clicking on the table so multi
			// element selection doesn't look terrible!
			if (e.shiftKey || e.metaKey || e.ctrlKey) {
				container
					.css('-moz-user-select', 'none')
					.one('selectstart.dtSelect', selector, function () {
						return false;
					});
			}

			if (window.getSelection) {
				matchSelection = window.getSelection();
			}
		})
		.on('mouseup.dtSelect', selector, function () {
			// Allow text selection to occur again, Mozilla style (tested in FF
			// 35.0.1 - still required)
			container.css('-moz-user-select', '');
		})
		.on('click.dtSelect', selector, function (e) {
			var items = dt.select.items();
			var idx;

			// If text was selected (click and drag), then we shouldn't change
			// the row's selected state
			if (matchSelection) {
				var selection = window.getSelection();

				// If the element that contains the selection is not in the table, we can ignore it
				// This can happen if the developer selects text from the click event
				if (
					!selection.anchorNode ||
					$(selection.anchorNode).closest('table')[0] === dt.table().node()
				) {
					if (selection !== matchSelection) {
						return;
					}
				}
			}

			var ctx = dt.settings()[0];
			var container = dt.table().container();

			// Ignore clicks inside a sub-table
			if ($(e.target).closest('div.dt-container')[0] != container) {
				return;
			}

			var cell = dt.cell($(e.target).closest('td, th'));

			// Check the cell actually belongs to the host DataTable (so child
			// rows, etc, are ignored)
			if (!cell.any()) {
				return;
			}

			var event = $.Event('user-select.dt');
			eventTrigger(dt, event, [items, cell, e]);

			if (event.isDefaultPrevented()) {
				return;
			}

			var cellIndex = cell.index();
			if (items === 'row') {
				idx = cellIndex.row;
				typeSelect(e, dt, ctx, 'row', idx);
			}
			else if (items === 'column') {
				idx = cell.index().column;
				typeSelect(e, dt, ctx, 'column', idx);
			}
			else if (items === 'cell') {
				idx = cell.index();
				typeSelect(e, dt, ctx, 'cell', idx);
			}

			ctx._select_lastCell = cellIndex;
		});

	// Blurable
	$('body').on('click.dtSelect' + _safeId(dt.table().node()), function (e) {
		if (ctx._select.blurable) {
			// If the click was inside the DataTables container, don't blur
			if ($(e.target).parents().filter(dt.table().container()).length) {
				return;
			}

			// Ignore elements which have been removed from the DOM (i.e. paging
			// buttons)
			if ($(e.target).parents('html').length === 0) {
				return;
			}

			// Don't blur in Editor form
			if ($(e.target).parents('div.DTE').length) {
				return;
			}

			var event = $.Event('select-blur.dt');
			eventTrigger(dt, event, [e.target, e]);

			if (event.isDefaultPrevented()) {
				return;
			}

			clear(ctx, true);
		}
	});
}

/**
 * Trigger an event on a DataTable
 *
 * @param {DataTable.Api} api      DataTable to trigger events on
 * @param  {boolean}      selected true if selected, false if deselected
 * @param  {string}       type     Item type acting on
 * @param  {boolean}      any      Require that there are values before
 *     triggering
 * @private
 */
function eventTrigger(api, type, args, any) {
	if (any && !api.flatten().length) {
		return;
	}

	if (typeof type === 'string') {
		type = type + '.dt';
	}

	args.unshift(api);

	$(api.table().node()).trigger(type, args);
}

/**
 * Determine if a column is a checkbox column
 * @param {*} col DataTables column object
 * @returns 
 */
function isCheckboxColumn(col) {
	return col.mRender && col.mRender._name === 'selectCheckbox';
}

/**
 * Update the information element of the DataTable showing information about the
 * items selected. This is done by adding tags to the existing text
 *
 * @param {DataTable.Api} api DataTable to update
 * @private
 */
function info(api, node) {
	if (api.select.style() === 'api' || api.select.info() === false) {
		return;
	}

	var ctx = api.settings()[0];
	var rowSetLength = ctx._select_set.length;
	var rows = rowSetLength ? rowSetLength : api.rows({ selected: true }).count();
	var columns = api.columns({ selected: true }).count();
	var cells = api.cells({ selected: true }).count();

	// If subtractive selection, then we need to take the number of rows and
	// subtract those that have been deselected
	if (ctx._select_mode === 'subtractive') {
		rows = api.page.info().recordsDisplay - rowSetLength;
	}

	var add = function (el, name, num) {
		el.append(
			$('<span class="select-item"/>').append(
				api.i18n(
					'select.' + name + 's',
					{ _: '%d ' + name + 's selected', 0: '', 1: '1 ' + name + ' selected' },
					num
				)
			)
		);
	};

	var el = $(node);
	var output = $('<span class="select-info"/>');

	add(output, 'row', rows);
	add(output, 'column', columns);
	add(output, 'cell', cells);

	var existing = el.children('span.select-info');

	if (existing.length) {
		existing.remove();
	}

	if (output.text() !== '') {
		el.append(output);
	}
}

/**
 * Add a checkbox to the header for checkbox columns, allowing all rows to
 * be selected, deselected or just to show the state.
 *
 * @param {*} dt API
 * @param {*} headerCheckbox the header checkbox option
 */
function initCheckboxHeader( dt, headerCheckbox ) {
	var dtSettings = dt.settings()[0];
	var dtInternalColumns = dtSettings.aoColumns;

	// Find any checkbox column(s)
	dt.columns().iterator('column', function (s, idx) {
		var col = dtInternalColumns[idx];

		// Checkbox columns have a rendering function with a given name
		if (! isCheckboxColumn(col)) {
			return;
		}
		var header = dt.column(idx).header();

		if (! $('input', header).length) {
			// If no checkbox yet, insert one
			var input = $('<input>')
				.attr({
					class: checkboxClass(true),
					type: 'checkbox',
					'aria-label': dt.i18n('select.aria.headerCheckbox') || 'Select all rows'
				})
				.appendTo(header)
				.on('change', function () {
					if (this.checked) {
						if (headerCheckbox == 'select-page') {
							dt.rows({page: 'current'}).select();
						}
						else {
							dt.rows({search: 'applied'}).select();
						}
					}
					else {
						if (headerCheckbox == 'select-page') {
							dt.rows({page: 'current', selected: true}).deselect();
						}
						else {
							dt.rows({selected: true}).deselect();
						}
					}
				})
				.on('click', function (e) {
					e.stopPropagation();
				});

			// Update the header checkbox's state when the selection in the
			// table changes
			dt.on('draw select deselect', function (e, pass, type) {
				if (type === 'row' || ! type) {
					var nums = headerCheckboxState(dt, headerCheckbox);

					if (nums.search && nums.search <= nums.count && nums.search === nums.available) {
						input
							.prop('checked', true)
							.prop('indeterminate', false);
					}
					else if (nums.search === 0 && nums.count === 0) {
						input
							.prop('checked', false)
							.prop('indeterminate', false);
					}
					else {
						input
							.prop('checked', false)
							.prop('indeterminate', true);
					}
				}
			});
		}
	});
}

function keysSet(dt) {
	var ctx = dt.settings()[0];
	var flag = ctx._select.keys;
	var namespace = 'dts-keys-' + ctx.sTableId;

	if (flag) {
		// Need a tabindex of the `tr` elements to make them focusable by the browser
		$(dt.rows({page: 'current'}).nodes()).attr('tabindex', 0);

		dt.on('draw.' + namespace, function () {
			$(dt.rows({page: 'current'}).nodes()).attr('tabindex', 0);
		});

		// Listen on document for tab, up and down
		$(document).on('keydown.' + namespace, function (e) {
			var key = e.keyCode;
			var active = document.activeElement;

			// Can't use e.key as it wasn't widely supported until 2017
			// 9 Tab
			// 13 Return
			// 32 Space
			// 38 ArrowUp
			// 40 ArrowDown
			if (! [9, 13, 32, 38, 40].includes(key)) {
				return;
			}

			var nodes = dt.rows({page: 'current'}).nodes().toArray();
			var idx = nodes.indexOf(active);
			var preventDefault = true;

			// Only take an action if a row has focus
			if (idx === -1) {
				return;
			}

			if (key === 9) {
				// Tab focus change
				if (e.shift === false && idx === nodes.length - 1) {
					keysPageDown(dt);
				}
				else if (e.shift === true && idx === 0) {
					keysPageUp(dt);
				}
				else {
					// Browser will do it for us
					preventDefault = false;
				}
			}
			else if (key === 13 || key === 32) {
				// Row selection / deselection
				var row = dt.row(active);

				if (row.selected()) {
					row.deselect();
				}
				else {
					row.select();
				}
			}
			else if (key === 38) {
				// Move up
				if (idx > 0) {
					nodes[idx-1].focus();
				}
				else {
					keysPageUp(dt);
				}
			}
			else {
				// Move down
				if (idx < nodes.length -1) {
					nodes[idx+1].focus();
				}
				else {
					keysPageDown(dt);
				}
			}

			if (preventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		});
	}
	else {
		// Stop the rows from being able to gain focus
		$(dt.rows().nodes()).removeAttr('tabindex');

		// Nuke events
		dt.off('draw.' + namespace);
		$(document).off('keydown.' + namespace);
	}
}

/**
 * Change to the next page and focus on the first row
 *
 * @param {DataTable.Api} dt DataTable instance
 */
function keysPageDown(dt) {
	// Is there another page to turn to?
	var info = dt.page.info();

	if (info.page < info.pages - 1) {
		dt
			.one('draw', function () {
				dt.row(':first-child').node().focus();
			})
			.page('next')
			.draw(false);
	}
}

/**
 * Change to the previous page and focus on the last row
 *
 * @param {DataTable.Api} dt DataTable instance
 */
function keysPageUp(dt) {
	// Is there another page to turn to?
	var info = dt.page.info();

	if (info.page > 0) {
		dt
			.one('draw', function () {
				dt.row(':last-child').node().focus();
			})
			.page('previous')
			.draw(false);
	}
}

/**
 * Determine the counts used to define the header checkbox's state
 *
 * @param {*} dt DT API
 * @param {*} headerCheckbox Configuration for what the header checkbox does
 * @returns Counts object
 */
function headerCheckboxState(dt, headerCheckbox) {
	var ctx = dt.settings()[0];
	var selectable = ctx._select.selectable;
	var available = 0;
	var count = headerCheckbox == 'select-page'
		? dt.rows({page: 'current', selected: true}).count()
		: dt.rows({selected: true}).count();
	var search = headerCheckbox == 'select-page'
		? dt.rows({page: 'current', selected: true}).count()
		: dt.rows({search: 'applied', selected: true}).count();

	if (! selectable) {
		available = headerCheckbox == 'select-page'
			? dt.rows({page: 'current'}).count()
			: dt.rows({search: 'applied'}).count();	
	}
	else {
		// Need to count how many rows are actually selectable to know if all selectable
		// rows are selected or not
		var indexes = headerCheckbox == 'select-page'
			? dt.rows({page: 'current'}).indexes()
			: dt.rows({search: 'applied'}).indexes();

		for (var i=0 ; i<indexes.length ; i++) {
			// For speed I use the internal DataTables object.
			var rowInternal = ctx.aoData[indexes[i]];
			var result = selectable(rowInternal._aData, rowInternal.nTr, indexes[i]);

			if (result) {
				available++;
			}
		}
	}

	return {
		available: available,
		count: count,
		search: search
	}
}

/**
 * Initialisation of a new table. Attach event handlers and callbacks to allow
 * Select to operate correctly.
 *
 * This will occur _after_ the initial DataTables initialisation, although
 * before Ajax data is rendered, if there is ajax data
 *
 * @param  {DataTable.settings} ctx Settings object to operate on
 * @private
 */
function init(ctx) {
	var api = new DataTable.Api(ctx);
	ctx._select_init = true;

	// When `additive` then `_select_set` contains a list of the row ids that
	// are selected. If `subtractive` then all rows are selected, except those
	// in `_select_set`, which is a list of ids.
	ctx._select_mode = 'additive';
	ctx._select_set = [];

	// Row callback so that classes can be added to rows and cells if the item
	// was selected before the element was created. This will happen with the
	// `deferRender` option enabled.
	//
	// This method of attaching to `aoRowCreatedCallback` is a hack until
	// DataTables has proper events for row manipulation If you are reviewing
	// this code to create your own plug-ins, please do not do this!
	ctx.aoRowCreatedCallback.push(function (row, data, index) {
			var i, ien;
			var d = ctx.aoData[index];
			var id = api.row(index).id();

			// Row
			if (
				d._select_selected ||
				(ctx._select_mode === 'additive' && ctx._select_set.includes(id)) ||
				(ctx._select_mode === 'subtractive' && ! ctx._select_set.includes(id))
			) {
				d._select_selected = true;

				$(row)
					.addClass(ctx._select.className)
					.find('input.' + checkboxClass(true)).prop('checked', true);
			}

			// Cells and columns - if separated out, we would need to do two
			// loops, so it makes sense to combine them into a single one
			for (i = 0, ien = ctx.aoColumns.length; i < ien; i++) {
				if (
					ctx.aoColumns[i]._select_selected ||
					(d._selected_cells && d._selected_cells[i])
				) {
					$(d.anCells[i]).addClass(ctx._select.className)
				}
			}
		}
	);

	_cumulativeEvents(api);

	// Update the table information element with selected item summary
	api.on('info.dt', function (e, ctx, node) {
		// Store the info node for updating on select / deselect
		if (!ctx._select.infoEls.includes(node)) {
			ctx._select.infoEls.push(node);
		}

		info(api, node);
	});

	api.on('select.dtSelect.dt deselect.dtSelect.dt', function () {
		ctx._select.infoEls.forEach(function (el) {
			info(api, el);
		});

		api.state.save();
	});

	// Clean up and release
	api.on('destroy.dtSelect', function () {
		// Remove class directly rather than calling deselect - which would trigger events
		$(api.rows({ selected: true }).nodes()).removeClass(api.settings()[0]._select.className);

		$('input.' + checkboxClass(true), api.table().header()).remove();

		disableMouseSelection(api);
		api.off('.dtSelect');
		$('body').off('.dtSelect' + _safeId(api.table().node()));
	});
}

/**
 * Add one or more items (rows or columns) to the selection when shift clicking
 * in OS selection style
 *
 * @param  {DataTable.Api} dt   DataTable
 * @param  {string}        type Row or column range selector
 * @param  {object}        idx  Item index to select to
 * @param  {object}        last Item index to select from
 * @private
 */
function rowColumnRange(dt, type, idx, last) {
	// Add a range of rows from the last selected row to this one
	var indexes = dt[type + 's']({ search: 'applied' }).indexes();
	var idx1 = indexes.indexOf(last);
	var idx2 = indexes.indexOf(idx);

	if (!dt[type + 's']({ selected: true }).any() && idx1 === -1) {
		// select from top to here - slightly odd, but both Windows and Mac OS
		// do this
		indexes.splice(indexes.indexOf(idx) + 1, indexes.length);
	}
	else {
		// reverse so we can shift click 'up' as well as down
		if (idx1 > idx2) {
			var tmp = idx2;
			idx2 = idx1;
			idx1 = tmp;
		}

		indexes.splice(idx2 + 1, indexes.length);
		indexes.splice(0, idx1);
	}

	if (!dt[type](idx, { selected: true }).any()) {
		// Select range
		dt[type + 's'](indexes).select();
	}
	else {
		// Deselect range - need to keep the clicked on row selected
		indexes.splice(indexes.indexOf(idx), 1);
		dt[type + 's'](indexes).deselect();
	}
}

/**
 * Clear all selected items
 *
 * @param  {DataTable.settings} ctx Settings object of the host DataTable
 * @param  {boolean} [force=false] Force the de-selection to happen, regardless
 *     of selection style
 * @private
 */
function clear(ctx, force) {
	if (force || ctx._select.style === 'single') {
		var api = new DataTable.Api(ctx);

		api.rows({ selected: true }).deselect();
		api.columns({ selected: true }).deselect();
		api.cells({ selected: true }).deselect();
	}
}

/**
 * Select items based on the current configuration for style and items.
 *
 * @param  {object}             e    Mouse event object
 * @param  {DataTables.Api}     dt   DataTable
 * @param  {DataTable.settings} ctx  Settings object of the host DataTable
 * @param  {string}             type Items to select
 * @param  {int|object}         idx  Index of the item to select
 * @private
 */
function typeSelect(e, dt, ctx, type, idx) {
	var style = dt.select.style();
	var toggleable = dt.select.toggleable();
	var isSelected = dt[type](idx, { selected: true }).any();

	if (isSelected && !toggleable) {
		return;
	}

	if (style === 'os') {
		if (e.ctrlKey || e.metaKey) {
			// Add or remove from the selection
			dt[type](idx).select(!isSelected);
		}
		else if (e.shiftKey) {
			if (type === 'cell') {
				cellRange(dt, idx, ctx._select_lastCell || null);
			}
			else {
				rowColumnRange(
					dt,
					type,
					idx,
					ctx._select_lastCell ? ctx._select_lastCell[type] : null
				);
			}
		}
		else {
			// No cmd or shift click - deselect if selected, or select
			// this row only
			var selected = dt[type + 's']({ selected: true });

			if (isSelected && selected.flatten().length === 1) {
				dt[type](idx).deselect();
			}
			else {
				selected.deselect();
				dt[type](idx).select();
			}
		}
	}
	else if (style == 'multi+shift') {
		if (e.shiftKey) {
			if (type === 'cell') {
				cellRange(dt, idx, ctx._select_lastCell || null);
			}
			else {
				rowColumnRange(
					dt,
					type,
					idx,
					ctx._select_lastCell ? ctx._select_lastCell[type] : null
				);
			}
		}
		else {
			dt[type](idx).select(!isSelected);
		}
	}
	else {
		dt[type](idx).select(!isSelected);
	}
}

function _safeId(node) {
	return node.id.replace(/[^a-zA-Z0-9\-\_]/g, '-');
}

/**
 * Set up event handlers for cumulative selection
 *
 * @param {*} api DT API instance
 */
function _cumulativeEvents(api) {
	// Add event listeners to add / remove from the _select_set
	api.on('select', function (e, dt, type, indexes) {
		// Only support for rows at the moment
		if (type !== 'row') {
			return;
		}

		var ctx = api.settings()[0];

		if (ctx._select_mode === 'additive') {
			// Add row to the selection list if it isn't already there
			_add(api, ctx._select_set, indexes);
		}
		else {
			// Subtractive - if a row is selected it should not in the list
			// as in subtractive mode the list gives the rows which are not
			// selected
			_remove(api, ctx._select_set, indexes);
		}
	});

	api.on('deselect', function (e, dt, type, indexes) {
		// Only support for rows at the moment
		if (type !== 'row') {
			return;
		}

		var ctx = api.settings()[0];

		if (ctx._select_mode === 'additive') {
			// List is of those rows selected, so remove it
			_remove(api, ctx._select_set, indexes);
		}
		else {
			// List is of rows which are deselected, so add it!
			_add(api, ctx._select_set, indexes);
		}
	});
}

function _add(api, arr, indexes) {
	for (var i=0 ; i<indexes.length ; i++) {
		var id = api.row(indexes[i]).id();

		if (id && id !== 'undefined' && ! arr.includes(id)) {
			arr.push(id);
		}
	}
}

function _remove(api, arr, indexes) {
	for (var i=0 ; i<indexes.length ; i++) {
		var id = api.row(indexes[i]).id();
		var idx = arr.indexOf(id);

		if (idx !== -1) {
			arr.splice(idx, 1);
		}
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables selectors
 */

// row and column are basically identical just assigned to different properties
// and checking a different array, so we can dynamically create the functions to
// reduce the code size
$.each(
	[
		{ type: 'row', prop: 'aoData' },
		{ type: 'column', prop: 'aoColumns' }
	],
	function (i, o) {
		DataTable.ext.selector[o.type].push(function (settings, opts, indexes) {
			var selected = opts.selected;
			var data;
			var out = [];

			if (selected !== true && selected !== false) {
				return indexes;
			}

			for (var i = 0, ien = indexes.length; i < ien; i++) {
				data = settings[o.prop][indexes[i]];

				if (
					data && (
						(selected === true && data._select_selected === true) ||
						(selected === false && !data._select_selected)
					)
				) {
					out.push(indexes[i]);
				}
			}

			return out;
		});
	}
);

DataTable.ext.selector.cell.push(function (settings, opts, cells) {
	var selected = opts.selected;
	var rowData;
	var out = [];

	if (selected === undefined) {
		return cells;
	}

	for (var i = 0, ien = cells.length; i < ien; i++) {
		rowData = settings.aoData[cells[i].row];

		if (
			rowData && (
				(selected === true &&
					rowData._selected_cells &&
					rowData._selected_cells[cells[i].column] === true) ||
				(selected === false &&
					(!rowData._selected_cells || !rowData._selected_cells[cells[i].column]))
			)
		) {
			out.push(cells[i]);
		}
	}

	return out;
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API
 *
 * For complete documentation, please refer to the docs/api directory or the
 * DataTables site
 */

// Local variables to improve compression
var apiRegister = DataTable.Api.register;
var apiRegisterPlural = DataTable.Api.registerPlural;

apiRegister('select()', function () {
	return this.iterator('table', function (ctx) {
		DataTable.select.init(new DataTable.Api(ctx));
	});
});

apiRegister('select.blurable()', function (flag) {
	if (flag === undefined) {
		return this.context[0]._select.blurable;
	}

	return this.iterator('table', function (ctx) {
		ctx._select.blurable = flag;
	});
});

apiRegister('select.toggleable()', function (flag) {
	if (flag === undefined) {
		return this.context[0]._select.toggleable;
	}

	return this.iterator('table', function (ctx) {
		ctx._select.toggleable = flag;
	});
});

apiRegister('select.info()', function (flag) {
	if (flag === undefined) {
		return this.context[0]._select.info;
	}

	return this.iterator('table', function (ctx) {
		ctx._select.info = flag;
	});
});

apiRegister('select.items()', function (items) {
	if (items === undefined) {
		return this.context[0]._select.items;
	}

	return this.iterator('table', function (ctx) {
		ctx._select.items = items;

		eventTrigger(new DataTable.Api(ctx), 'selectItems', [items]);
	});
});

apiRegister('select.keys()', function (flag) {
	if (flag === undefined) {
		return this.context[0]._select.keys;
	}

	return this.iterator('table', function (ctx) {
		if (!ctx._select) {
			DataTable.select.init(new DataTable.Api(ctx));
		}

		ctx._select.keys = flag;

		keysSet(new DataTable.Api(ctx));
	});
});

// Takes effect from the _next_ selection. None disables future selection, but
// does not clear the current selection. Use the `deselect` methods for that
apiRegister('select.style()', function (style) {
	if (style === undefined) {
		return this.context[0]._select.style;
	}

	return this.iterator('table', function (ctx) {
		if (!ctx._select) {
			DataTable.select.init(new DataTable.Api(ctx));
		}

		if (!ctx._select_init) {
			init(ctx);
		}

		ctx._select.style = style;

		// Add / remove mouse event handlers. They aren't required when only
		// API selection is available
		var dt = new DataTable.Api(ctx);

		if (style !== 'api') {
			dt.ready(function () {
				disableMouseSelection(dt);
				enableMouseSelection(dt);
			});
		}
		else {
			disableMouseSelection(dt);
		}

		eventTrigger(new DataTable.Api(ctx), 'selectStyle', [style]);
	});
});

apiRegister('select.selector()', function (selector) {
	if (selector === undefined) {
		return this.context[0]._select.selector;
	}

	return this.iterator('table', function (ctx) {
		var dt = new DataTable.Api(ctx);
		var style = ctx._select.style;

		disableMouseSelection(dt);

		ctx._select.selector = selector;

		if (style && style !== 'api') {
			dt.ready(function () {
				disableMouseSelection(dt);
				enableMouseSelection(dt);
			});
		}
		else {
			disableMouseSelection(dt);
		}
	});
});

apiRegister('select.selectable()', function (set) {
	let ctx = this.context[0];

	if (set) {
		ctx._select.selectable = set;
		return this;
	}

	return ctx._select.selectable;
});

apiRegister('select.last()', function (set) {
	let ctx = this.context[0];

	if (set) {
		ctx._select_lastCell = set;
		return this;
	}

	return ctx._select_lastCell;
});

apiRegister('select.cumulative()', function (mode) {
	if (mode) {
		return this.iterator('table', function (ctx) {
			if (ctx._select_mode === mode) {
				return;
			}

			var dt = new DataTable.Api(ctx);

			// Convert from the current mode, to the new
			if (mode === 'subtractive') {
				// For subtractive mode we track the row ids which are not selected
				var unselected = dt.rows({selected: false}).ids().toArray();

				ctx._select_mode = mode;
				ctx._select_set.length = 0;
				ctx._select_set.push.apply(ctx._select_set, unselected);
			}
			else {
				// Switching to additive, so selected rows are to be used
				var selected = dt.rows({selected: true}).ids().toArray();

				ctx._select_mode = mode;
				ctx._select_set.length = 0;
				ctx._select_set.push.apply(ctx._select_set, selected);
			}
		}).draw(false);
	}

	let ctx = this.context[0];

	if (ctx && ctx._select_set) {
		return {
			mode: ctx._select_mode,
			rows: ctx._select_set
		};
	}

	return null;
});

apiRegisterPlural('rows().select()', 'row().select()', function (select) {
	var api = this;
	var selectedIndexes = [];

	if (select === false) {
		return this.deselect();
	}

	this.iterator('row', function (ctx, idx) {
		clear(ctx);

		// There is a good amount of knowledge of DataTables internals in
		// this function. It _could_ be done without that, but it would hurt
		// performance (or DT would need new APIs for this work)
		var dtData = ctx.aoData[idx];
		var dtColumns = ctx.aoColumns;

		if (ctx._select.selectable) {
			var result = ctx._select.selectable(dtData._aData, dtData.nTr, idx);

			if (result === false) {
				// Not selectable - do nothing
				return;
			}
		}

		$(dtData.nTr).addClass(ctx._select.className);
		dtData._select_selected = true;

		selectedIndexes.push(idx);

		for (var i=0 ; i<dtColumns.length ; i++) {
			var col = dtColumns[i];

			// Regenerate the column type if not present
			if (col.sType === null) {
				api.columns().types()
			}
			
			if (isCheckboxColumn(col)) {
				var cells = dtData.anCells;

				// Make sure the checkbox shows the right state
				if (cells && cells[i]) {
					$('input.' + checkboxClass(true), cells[i]).prop('checked', true);
				}

				// Invalidate the sort data for this column, if not already done
				if (dtData._aSortData !== null) {
					dtData._aSortData[i] = null;
				}
			}
		}
	});

	this.iterator('table', function (ct) {
		eventTrigger(api, 'select', ['row', selectedIndexes], true);
	});

	return this;
});

apiRegister('row().selected()', function () {
	var ctx = this.context[0];

	if (ctx && this.length && ctx.aoData[this[0]] && ctx.aoData[this[0]]._select_selected) {
		return true;
	}

	return false;
});

apiRegister('row().focus()', function () {
	var ctx = this.context[0];

	if (ctx && this.length && ctx.aoData[this[0]] && ctx.aoData[this[0]].nTr) {
		ctx.aoData[this[0]].nTr.focus();
	}
});

apiRegister('row().blur()', function () {
	var ctx = this.context[0];

	if (ctx && this.length && ctx.aoData[this[0]] && ctx.aoData[this[0]].nTr) {
		ctx.aoData[this[0]].nTr.blur();
	}
});

apiRegisterPlural('columns().select()', 'column().select()', function (select) {
	var api = this;

	if (select === false) {
		return this.deselect();
	}

	this.iterator('column', function (ctx, idx) {
		clear(ctx);

		ctx.aoColumns[idx]._select_selected = true;

		var column = new DataTable.Api(ctx).column(idx);

		$(column.header()).addClass(ctx._select.className);
		$(column.footer()).addClass(ctx._select.className);

		column.nodes().to$().addClass(ctx._select.className);
	});

	this.iterator('table', function (ctx, i) {
		eventTrigger(api, 'select', ['column', api[i]], true);
	});

	return this;
});

apiRegister('column().selected()', function () {
	var ctx = this.context[0];

	if (ctx && this.length && ctx.aoColumns[this[0]] && ctx.aoColumns[this[0]]._select_selected) {
		return true;
	}

	return false;
});

apiRegisterPlural('cells().select()', 'cell().select()', function (select) {
	var api = this;

	if (select === false) {
		return this.deselect();
	}

	this.iterator('cell', function (ctx, rowIdx, colIdx) {
		clear(ctx);

		var data = ctx.aoData[rowIdx];

		if (data._selected_cells === undefined) {
			data._selected_cells = [];
		}

		data._selected_cells[colIdx] = true;

		if (data.anCells) {
			$(data.anCells[colIdx]).addClass(ctx._select.className);
		}
	});

	this.iterator('table', function (ctx, i) {
		eventTrigger(api, 'select', ['cell', api.cells(api[i]).indexes().toArray()], true);
	});

	return this;
});

apiRegister('cell().selected()', function () {
	var ctx = this.context[0];

	if (ctx && this.length) {
		var row = ctx.aoData[this[0][0].row];

		if (row && row._selected_cells && row._selected_cells[this[0][0].column]) {
			return true;
		}
	}

	return false;
});

apiRegisterPlural('rows().deselect()', 'row().deselect()', function () {
	var api = this;

	this.iterator('row', function (ctx, idx) {
		// Like the select action, this has a lot of knowledge about DT internally
		var dtData = ctx.aoData[idx];
		var dtColumns = ctx.aoColumns;

		$(dtData.nTr).removeClass(ctx._select.className);
		dtData._select_selected = false;
		ctx._select_lastCell = null;

		for (var i=0 ; i<dtColumns.length ; i++) {
			var col = dtColumns[i];

			// Regenerate the column type if not present
			if (col.sType === null) {
				api.columns().types()
			}
			
			if (isCheckboxColumn(col)) {
				var cells = dtData.anCells;

				// Make sure the checkbox shows the right state
				if (cells && cells[i]) {
					$('input.' + checkboxClass(true), dtData.anCells[i]).prop('checked', false);
				}

				// Invalidate the sort data for this column, if not already done
				if (dtData._aSortData !== null) {
					dtData._aSortData[i] = null;
				}
			}
		}
	});

	this.iterator('table', function (ctx, i) {
		eventTrigger(api, 'deselect', ['row', api[i]], true);
	});

	return this;
});

apiRegisterPlural('columns().deselect()', 'column().deselect()', function () {
	var api = this;

	this.iterator('column', function (ctx, idx) {
		ctx.aoColumns[idx]._select_selected = false;

		var api = new DataTable.Api(ctx);
		var column = api.column(idx);

		$(column.header()).removeClass(ctx._select.className);
		$(column.footer()).removeClass(ctx._select.className);

		// Need to loop over each cell, rather than just using
		// `column().nodes()` as cells which are individually selected should
		// not have the `selected` class removed from them
		api.cells(null, idx)
			.indexes()
			.each(function (cellIdx) {
				var data = ctx.aoData[cellIdx.row];
				var cellSelected = data._selected_cells;

				if (data.anCells && (!cellSelected || !cellSelected[cellIdx.column])) {
					$(data.anCells[cellIdx.column]).removeClass(ctx._select.className);
				}
			});
	});

	this.iterator('table', function (ctx, i) {
		eventTrigger(api, 'deselect', ['column', api[i]], true);
	});

	return this;
});

apiRegisterPlural('cells().deselect()', 'cell().deselect()', function () {
	var api = this;

	this.iterator('cell', function (ctx, rowIdx, colIdx) {
		var data = ctx.aoData[rowIdx];

		if (data._selected_cells !== undefined) {
			data._selected_cells[colIdx] = false;
		}

		// Remove class only if the cells exist, and the cell is not column
		// selected, in which case the class should remain (since it is selected
		// in the column)
		if (data.anCells && !ctx.aoColumns[colIdx]._select_selected) {
			$(data.anCells[colIdx]).removeClass(ctx._select.className);
		}
	});

	this.iterator('table', function (ctx, i) {
		eventTrigger(api, 'deselect', ['cell', api[i]], true);
	});

	return this;
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Buttons
 */
function i18n(label, def) {
	return function (dt) {
		return dt.i18n('buttons.' + label, def);
	};
}

// Common events with suitable namespaces
function namespacedEvents(config) {
	var unique = config._eventNamespace;

	return 'draw.dt.DT' + unique + ' select.dt.DT' + unique + ' deselect.dt.DT' + unique;
}

function enabled(dt, config) {
	if (config.limitTo.indexOf('rows') !== -1 && dt.rows({ selected: true }).any()) {
		return true;
	}

	if (config.limitTo.indexOf('columns') !== -1 && dt.columns({ selected: true }).any()) {
		return true;
	}

	if (config.limitTo.indexOf('cells') !== -1 && dt.cells({ selected: true }).any()) {
		return true;
	}

	return false;
}

var _buttonNamespace = 0;

$.extend(DataTable.ext.buttons, {
	selected: {
		text: i18n('selected', 'Selected'),
		className: 'buttons-selected',
		limitTo: ['rows', 'columns', 'cells'],
		init: function (dt, node, config) {
			var that = this;
			config._eventNamespace = '.select' + _buttonNamespace++;

			// .DT namespace listeners are removed by DataTables automatically
			// on table destroy
			dt.on(namespacedEvents(config), function () {
				that.enable(enabled(dt, config));
			});

			this.disable();
		},
		destroy: function (dt, node, config) {
			dt.off(config._eventNamespace);
		}
	},
	selectedSingle: {
		text: i18n('selectedSingle', 'Selected single'),
		className: 'buttons-selected-single',
		init: function (dt, node, config) {
			var that = this;
			config._eventNamespace = '.select' + _buttonNamespace++;

			dt.on(namespacedEvents(config), function () {
				var count =
					dt.rows({ selected: true }).flatten().length +
					dt.columns({ selected: true }).flatten().length +
					dt.cells({ selected: true }).flatten().length;

				that.enable(count === 1);
			});

			this.disable();
		},
		destroy: function (dt, node, config) {
			dt.off(config._eventNamespace);
		}
	},
	selectAll: {
		text: i18n('selectAll', 'Select all'),
		className: 'buttons-select-all',
		action: function (e, dt, node, config) {
			var items = this.select.items();
			var mod = config.selectorModifier;
			
			if (mod) {
				if (typeof mod === 'function') {
					mod = mod.call(dt, e, dt, node, config);
				}

				this[items + 's'](mod).select();
			}
			else {
				this[items + 's']().select();
			}
		}
		// selectorModifier can be specified
	},
	selectNone: {
		text: i18n('selectNone', 'Deselect all'),
		className: 'buttons-select-none',
		action: function () {
			clear(this.settings()[0], true);
		},
		init: function (dt, node, config) {
			var that = this;
			config._eventNamespace = '.select' + _buttonNamespace++;

			dt.on(namespacedEvents(config), function () {
				var count =
					dt.rows({ selected: true }).flatten().length +
					dt.columns({ selected: true }).flatten().length +
					dt.cells({ selected: true }).flatten().length;

				that.enable(count > 0);
			});

			this.disable();
		},
		destroy: function (dt, node, config) {
			dt.off(config._eventNamespace);
		}
	},
	showSelected: {
		text: i18n('showSelected', 'Show only selected'),
		className: 'buttons-show-selected',
		action: function (e, dt) {
			if (dt.search.fixed('dt-select')) {
				// Remove existing function
				dt.search.fixed('dt-select', null);

				this.active(false);
			}
			else {
				// Use a fixed filtering function to match on selected rows
				// This needs to reference the internal aoData since that is
				// where Select stores its reference for the selected state
				var dataSrc = dt.settings()[0].aoData;

				dt.search.fixed('dt-select', function (text, data, idx) {
					// _select_selected is set by Select on the data object for the row
					return dataSrc[idx]._select_selected;
				});

				this.active(true);
			}

			dt.draw();
		}
	}
});

$.each(['Row', 'Column', 'Cell'], function (i, item) {
	var lc = item.toLowerCase();

	DataTable.ext.buttons['select' + item + 's'] = {
		text: i18n('select' + item + 's', 'Select ' + lc + 's'),
		className: 'buttons-select-' + lc + 's',
		action: function () {
			this.select.items(lc);
		},
		init: function (dt) {
			var that = this;

			this.active(dt.select.items() === lc);

			dt.on('selectItems.dt.DT', function (e, ctx, items) {
				that.active(items === lc);
			});
		}
	};
});

// Note that DataTables 2.1 has more robust type detection, but we retain
// backwards compatibility with 2.0 for the moment.
DataTable.type('select-checkbox', {
	className: 'dt-select',
	detect: DataTable.versionCheck('2.1')
		? {
			oneOf: function () {
				return false; // no op
			},
			allOf: function () {
				return false; // no op
			},
			init: function (settings, col, idx) {
				return isCheckboxColumn(col);
			}
		}
		: function (data) {
			// Rendering function will tell us if it is a checkbox type
			return data === 'select-checkbox' ? data : false;
		},
	order: {
		pre: function (d) {
			return d === 'X' ? -1 : 0;
		}
	}
});

$.extend(true, DataTable.defaults.oLanguage, {
	select: {
		aria: {
			rowCheckbox: 'Select row'
		}
	}
});

DataTable.render.select = function (valueProp, nameProp) {
	var valueFn = valueProp ? DataTable.util.get(valueProp) : null;
	var nameFn = nameProp ? DataTable.util.get(nameProp) : null;

	var fn = function (data, type, row, meta) {
		var dtRow = meta.settings.aoData[meta.row];
		var selected = dtRow._select_selected;
		var ariaLabel = meta.settings.oLanguage.select.aria.rowCheckbox;
		var selectable = meta.settings._select.selectable;

		if (type === 'display') {
			// Check if the row is selectable before showing the checkbox
			if (selectable) {
				var result = selectable(row, dtRow.nTr, meta.row);
	
				if (result === false) {
					return '';
				}
			}

			return $('<input>')
				.attr({
					'aria-label': ariaLabel,
					class: checkboxClass(),
					name: nameFn ? nameFn(row) : null,
					type: 'checkbox',
					value: valueFn ? valueFn(row) : null,
					checked: selected
				})
				.on('input', function (e) {
					// Let Select 100% control the state of the checkbox
					e.preventDefault();

					// And make sure this checkbox matches it's row as it is possible
					// to check out of sync if this was clicked on to deselect a range
					// but remains selected itself
					this.checked = $(this).closest('tr').hasClass('selected');
				})[0];
		}
		else if (type === 'type') {
			return 'select-checkbox';
		}
		else if (type === 'filter') {
			return '';
		}

		return selected ? 'X' : '';
	}

	// Workaround so uglify doesn't strip the function name. It is used
	// for the column type detection.
	fn._name = 'selectCheckbox';

	return fn;
}

// Legacy checkbox ordering
DataTable.ext.order['select-checkbox'] = function (settings, col) {
	return this.api()
		.column(col, { order: 'index' })
		.nodes()
		.map(function (td) {
			if (settings._select.items === 'row') {
				return $(td).parent().hasClass(settings._select.className).toString();
			}
			else if (settings._select.items === 'cell') {
				return $(td).hasClass(settings._select.className).toString();
			}
			return false;
		});
};

$.fn.DataTable.select = DataTable.select;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialisation
 */

// DataTables creation - we need this to run _before_ data is read in, but
// for backwards compat. we also run again on preInit. If it happens twice
// it will simply do nothing the second time around.
$(document).on('i18n.dt.dtSelect preInit.dt.dtSelect', function (e, ctx) {
	if (e.namespace !== 'dt') {
		return;
	}

	DataTable.select.init(new DataTable.Api(ctx));
});


return DataTable;
}));


/*! StateRestore 1.4.1
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


(function () {
    'use strict';

    var $$2;
    var dataTable$1;
    function setJQuery$1(jq) {
        $$2 = jq;
        dataTable$1 = jq.fn.dataTable;
    }
    var StateRestore = /** @class */ (function () {
        function StateRestore(settings, opts, identifier, state, isPreDefined, successCallback) {
            if (state === void 0) { state = undefined; }
            if (isPreDefined === void 0) { isPreDefined = false; }
            if (successCallback === void 0) { successCallback = function () { return null; }; }
            // Check that the required version of DataTables is included
            if (!dataTable$1 || !dataTable$1.versionCheck || !dataTable$1.versionCheck('1.10.0')) {
                throw new Error('StateRestore requires DataTables 1.10 or newer');
            }
            // Check that Select is included
            // eslint-disable-next-line no-extra-parens
            if (!dataTable$1.Buttons) {
                throw new Error('StateRestore requires Buttons');
            }
            var table = new dataTable$1.Api(settings);
            this.classes = $$2.extend(true, {}, StateRestore.classes);
            // Get options from user
            this.c = $$2.extend(true, {}, StateRestore.defaults, opts);
            this.s = {
                dt: table,
                identifier: identifier,
                isPreDefined: isPreDefined,
                savedState: null,
                tableId: state && state.stateRestore ? state.stateRestore.tableId : undefined
            };
            this.dom = {
                background: $$2('<div class="' + this.classes.background + '"/>'),
                closeButton: $$2('<div class="' + this.classes.closeButton + '">&times;</div>'),
                confirmation: $$2('<div class="' + this.classes.confirmation + '"/>'),
                confirmationButton: $$2('<button class="' + this.classes.confirmationButton + ' ' + this.classes.dtButton + '">'),
                confirmationTitleRow: $$2('<div class="' + this.classes.confirmationTitleRow + '"></div>'),
                dtContainer: $$2(this.s.dt.table().container()),
                duplicateError: $$2('<span class="' + this.classes.modalError + '">' +
                    this.s.dt.i18n('stateRestore.duplicateError', this.c.i18n.duplicateError) +
                    '</span>'),
                emptyError: $$2('<span class="' + this.classes.modalError + '">' +
                    this.s.dt.i18n('stateRestore.emptyError', this.c.i18n.emptyError) +
                    '</span>'),
                removeContents: $$2('<div class="' + this.classes.confirmationText + '"><span>' +
                    this.s.dt
                        .i18n('stateRestore.removeConfirm', this.c.i18n.removeConfirm)
                        .replace(/%s/g, StateRestore.entityEncode(this.s.identifier)) +
                    '</span></div>'),
                removeError: $$2('<span class="' + this.classes.modalError + '">' +
                    this.s.dt.i18n('stateRestore.removeError', this.c.i18n.removeError) +
                    '</span>'),
                removeTitle: $$2('<h2 class="' + this.classes.confirmationTitle + '">' +
                    this.s.dt.i18n('stateRestore.removeTitle', this.c.i18n.removeTitle) +
                    '</h2>'),
                renameContents: $$2('<div class="' + this.classes.confirmationText + ' ' + this.classes.renameModal + '">' +
                    '<label class="' + this.classes.confirmationMessage + '">' +
                    this.s.dt
                        .i18n('stateRestore.renameLabel', this.c.i18n.renameLabel)
                        .replace(/%s/g, StateRestore.entityEncode(this.s.identifier)) +
                    '</label>' +
                    '</div>'),
                renameInput: $$2('<input class="' + this.classes.input + '" type="text"></input>'),
                renameTitle: $$2('<h2 class="' + this.classes.confirmationTitle + '">' +
                    this.s.dt.i18n('stateRestore.renameTitle', this.c.i18n.renameTitle) +
                    '</h2>')
            };
            // When a StateRestore instance is created the current state of the table should also be saved.
            this.save(state, successCallback);
        }
        /**
         * Removes a state from storage and then triggers the dtsr-remove event
         * so that the StateRestoreCollection class can remove it's references as well.
         *
         * @param skipModal Flag to indicate if the modal should be skipped or not
         */
        StateRestore.prototype.remove = function (skipModal) {
            var _a;
            var _this = this;
            if (skipModal === void 0) { skipModal = false; }
            // Check if removal of states is allowed
            if (!this.c.remove) {
                return false;
            }
            var removeFunction;
            var ajaxData = {
                action: 'remove',
                stateRestore: (_a = {},
                    _a[this.s.identifier] = this.s.savedState,
                    _a)
            };
            var successCallback = function () {
                _this.dom.confirmation.trigger('dtsr-remove');
                $$2(_this.s.dt.table().node()).trigger('stateRestore-change');
                _this.dom.background.click();
                _this.dom.confirmation.remove();
                $$2(document).unbind('keyup', function (e) { return _this._keyupFunction(e); });
                _this.dom.confirmationButton.off('click');
            };
            // If the remove is not happening over ajax remove it from local storage and then trigger the event
            if (!this.c.ajax) {
                removeFunction = function () {
                    try {
                        localStorage.removeItem('DataTables_stateRestore_' + _this.s.identifier + '_' + location.pathname +
                            (_this.s.tableId ? '_' + _this.s.tableId : ''));
                        successCallback();
                    }
                    catch (e) {
                        _this.dom.confirmation.children('.' + _this.classes.modalError).remove();
                        _this.dom.confirmation.append(_this.dom.removeError);
                        return 'remove';
                    }
                    return true;
                };
            }
            // Ajax property has to be a string, not just true
            // Also only want to save if the table has been initialised and the states have been loaded in
            else if (typeof this.c.ajax === 'string' && this.s.dt.settings()[0]._bInitComplete) {
                removeFunction = function () {
                    $$2.ajax({
                        data: ajaxData,
                        success: successCallback,
                        type: 'POST',
                        url: _this.c.ajax
                    });
                    return true;
                };
            }
            else if (typeof this.c.ajax === 'function') {
                removeFunction = function () {
                    if (typeof _this.c.ajax === 'function') {
                        _this.c.ajax.call(_this.s.dt, ajaxData, successCallback);
                    }
                    return true;
                };
            }
            // If the modal is to be skipped then remove straight away
            if (skipModal) {
                this.dom.confirmation.appendTo(this.dom.dtContainer);
                $$2(this.s.dt.table().node()).trigger('dtsr-modal-inserted');
                removeFunction();
                this.dom.confirmation.remove();
            }
            // Otherwise display the modal
            else {
                this._newModal(this.dom.removeTitle, this.s.dt.i18n('stateRestore.removeSubmit', this.c.i18n.removeSubmit), removeFunction, this.dom.removeContents);
            }
            return true;
        };
        /**
         * Compares the state held within this instance with a state that is passed in
         *
         * @param state The state that is to be compared against
         * @returns boolean indicating if the states match
         */
        StateRestore.prototype.compare = function (state) {
            // Order
            if (!this.c.saveState.order) {
                state.order = undefined;
            }
            // Search
            if (!this.c.saveState.search) {
                state.search = undefined;
            }
            // Columns
            if (this.c.saveState.columns && state.columns) {
                for (var i = 0, ien = state.columns.length; i < ien; i++) {
                    // Visibility
                    if (typeof this.c.saveState.columns !== 'boolean' && !this.c.saveState.columns.visible) {
                        state.columns[i].visible = undefined;
                    }
                    // Search
                    if (typeof this.c.saveState.columns !== 'boolean' && !this.c.saveState.columns.search) {
                        state.columns[i].search = undefined;
                    }
                }
            }
            else if (!this.c.saveState.columns) {
                state.columns = undefined;
            }
            // Paging
            if (!this.c.saveState.paging) {
                state.page = undefined;
            }
            // SearchBuilder
            if (!this.c.saveState.searchBuilder) {
                state.searchBuilder = undefined;
            }
            // SearchPanes
            if (!this.c.saveState.searchPanes) {
                state.searchPanes = undefined;
            }
            // Select
            if (!this.c.saveState.select) {
                state.select = undefined;
            }
            // ColReorder
            if (!this.c.saveState.colReorder) {
                state.ColReorder = undefined;
            }
            // Scroller
            if (!this.c.saveState.scroller) {
                state.scroller = undefined;
                if (dataTable$1.Scroller !== undefined) {
                    state.start = 0;
                }
            }
            // Paging
            if (!this.c.saveState.paging) {
                state.start = 0;
            }
            // Page Length
            if (!this.c.saveState.length) {
                state.length = undefined;
            }
            // Need to delete properties that we do not want to compare
            delete state.time;
            var copyState = this.s.savedState;
            delete copyState.time;
            delete copyState.c;
            delete copyState.stateRestore;
            // Perform a deep compare of the two state objects
            return this._deepCompare(state, copyState);
        };
        /**
         * Removes all of the dom elements from the document
         */
        StateRestore.prototype.destroy = function () {
            $$2.each(this.dom, function (name, el) {
                el.off().remove();
            });
        };
        /**
         * Loads the state referenced by the identifier from storage
         *
         * @param state The identifier of the state that should be loaded
         * @returns the state that has been loaded
         */
        StateRestore.prototype.load = function () {
            var _this = this;
            var loadedState = this.s.savedState;
            var settings = this.s.dt.settings()[0];
            // Always want the states stored here to be loaded in - regardless of when they were created
            loadedState.time = +new Date();
            settings.oLoadedState = $$2.extend(true, {}, loadedState);
            // Click on a background if there is one to shut the collection
            $$2('div.dt-button-background').click();
            var loaded = function () {
                var correctPaging = function (e, preSettings) {
                    setTimeout(function () {
                        var currpage = preSettings._iDisplayStart / preSettings._iDisplayLength;
                        var intendedPage = loadedState.start / loadedState.length;
                        // If the paging is incorrect then we have to set it again so that it is correct
                        // This happens when a searchpanes filter is removed
                        // This has to happen in a timeout because searchpanes only deselects after a timeout
                        if (currpage >= 0 && intendedPage >= 0 && currpage !== intendedPage) {
                            _this.s.dt.page(intendedPage).draw(false);
                        }
                    }, 50);
                };
                _this.s.dt.one('preDraw', correctPaging);
                _this.s.dt.draw(false);
            };
            // Call the internal datatables function to implement the state on the table
            if (DataTable.versionCheck('2')) {
                this.s.dt.state(loadedState);
                loaded();
            }
            else {
                // Legacy
                DataTable.ext.oApi._fnImplementState(settings, loadedState, loaded);
            }
            return loadedState;
        };
        /**
         * Shows a modal that allows a state to be renamed
         *
         * @param newIdentifier Optional. The new identifier for this state
         */
        StateRestore.prototype.rename = function (newIdentifier, currentIdentifiers) {
            var _this = this;
            if (newIdentifier === void 0) { newIdentifier = null; }
            // Check if renaming of states is allowed
            if (!this.c.rename) {
                return;
            }
            var renameFunction = function () {
                var _a;
                if (newIdentifier === null) {
                    var tempIdentifier = $$2('input.' + _this.classes.input.replace(/ /g, '.')).val();
                    if (tempIdentifier.length === 0) {
                        _this.dom.confirmation.children('.' + _this.classes.modalError).remove();
                        _this.dom.confirmation.append(_this.dom.emptyError);
                        return 'empty';
                    }
                    else if (currentIdentifiers.includes(tempIdentifier)) {
                        _this.dom.confirmation.children('.' + _this.classes.modalError).remove();
                        _this.dom.confirmation.append(_this.dom.duplicateError);
                        return 'duplicate';
                    }
                    else {
                        newIdentifier = tempIdentifier;
                    }
                }
                var ajaxData = {
                    action: 'rename',
                    stateRestore: (_a = {},
                        _a[_this.s.identifier] = newIdentifier,
                        _a)
                };
                var successCallback = function () {
                    _this.s.identifier = newIdentifier;
                    _this.save(_this.s.savedState, function () { return null; }, false);
                    _this.dom.removeContents = $$2('<div class="' + _this.classes.confirmationText + '"><span>' +
                        _this.s.dt
                            .i18n('stateRestore.removeConfirm', _this.c.i18n.removeConfirm)
                            .replace(/%s/g, _this.s.identifier) +
                        '</span></div>');
                    _this.dom.confirmation.trigger('dtsr-rename');
                    _this.dom.background.click();
                    _this.dom.confirmation.remove();
                    $$2(document).unbind('keyup', function (e) { return _this._keyupFunction(e); });
                    _this.dom.confirmationButton.off('click');
                };
                if (!_this.c.ajax) {
                    try {
                        localStorage.removeItem('DataTables_stateRestore_' + _this.s.identifier + '_' + location.pathname +
                            (_this.s.tableId ? '_' + _this.s.tableId : ''));
                        successCallback();
                    }
                    catch (e) {
                        _this.dom.confirmation.children('.' + _this.classes.modalError).remove();
                        _this.dom.confirmation.append(_this.dom.removeError);
                        return false;
                    }
                }
                else if (typeof _this.c.ajax === 'string' && _this.s.dt.settings()[0]._bInitComplete) {
                    $$2.ajax({
                        data: ajaxData,
                        success: successCallback,
                        type: 'POST',
                        url: _this.c.ajax
                    });
                }
                else if (typeof _this.c.ajax === 'function') {
                    _this.c.ajax.call(_this.s.dt, ajaxData, successCallback);
                }
                return true;
            };
            // Check if a new identifier has been provided, if so no need for a modal
            if (newIdentifier !== null) {
                if (currentIdentifiers.includes(newIdentifier)) {
                    throw new Error(this.s.dt.i18n('stateRestore.duplicateError', this.c.i18n.duplicateError));
                }
                else if (newIdentifier.length === 0) {
                    throw new Error(this.s.dt.i18n('stateRestore.emptyError', this.c.i18n.emptyError));
                }
                else {
                    this.dom.confirmation.appendTo(this.dom.dtContainer);
                    $$2(this.s.dt.table().node()).trigger('dtsr-modal-inserted');
                    renameFunction();
                    this.dom.confirmation.remove();
                }
            }
            else {
                this.dom.renameInput.val(this.s.identifier);
                this.dom.renameContents.append(this.dom.renameInput);
                this._newModal(this.dom.renameTitle, this.s.dt.i18n('stateRestore.renameButton', this.c.i18n.renameButton), renameFunction, this.dom.renameContents);
            }
        };
        /**
         * Saves the tables current state using the identifier that is passed in.
         *
         * @param state Optional. If provided this is the state that will be saved rather than using the current state
         */
        StateRestore.prototype.save = function (state, passedSuccessCallback, callAjax) {
            var _a;
            var _this = this;
            if (callAjax === void 0) { callAjax = true; }
            // Check if saving states is allowed
            if (!this.c.save) {
                if (passedSuccessCallback) {
                    passedSuccessCallback.call(this);
                }
                return;
            }
            // this.s.dt.state.save();
            var savedState;
            // If no state has been provided then create a new one from the current state
            this.s.dt.state.save();
            if (state === undefined) {
                savedState = this.s.dt.state();
            }
            else if (typeof state !== 'object') {
                return;
            }
            else {
                savedState = state;
            }
            if (savedState.stateRestore) {
                savedState.stateRestore.isPreDefined = this.s.isPreDefined;
                savedState.stateRestore.state = this.s.identifier;
                savedState.stateRestore.tableId = this.s.tableId;
            }
            else {
                savedState.stateRestore = {
                    isPreDefined: this.s.isPreDefined,
                    state: this.s.identifier,
                    tableId: this.s.tableId
                };
            }
            this.s.savedState = savedState;
            // Order
            if (!this.c.saveState.order) {
                this.s.savedState.order = undefined;
            }
            // Search
            if (!this.c.saveState.search) {
                this.s.savedState.search = undefined;
            }
            // Columns
            if (this.c.saveState.columns && this.s.savedState.columns) {
                for (var i = 0, ien = this.s.savedState.columns.length; i < ien; i++) {
                    // Visibility
                    if (typeof this.c.saveState.columns !== 'boolean' && !this.c.saveState.columns.visible) {
                        this.s.savedState.columns[i].visible = undefined;
                    }
                    // Search
                    if (typeof this.c.saveState.columns !== 'boolean' && !this.c.saveState.columns.search) {
                        this.s.savedState.columns[i].search = undefined;
                    }
                }
            }
            else if (!this.c.saveState.columns) {
                this.s.savedState.columns = undefined;
            }
            // SearchBuilder
            if (!this.c.saveState.searchBuilder) {
                this.s.savedState.searchBuilder = undefined;
            }
            // SearchPanes
            if (!this.c.saveState.searchPanes) {
                this.s.savedState.searchPanes = undefined;
            }
            // Select
            if (!this.c.saveState.select) {
                this.s.savedState.select = undefined;
            }
            // ColReorder
            if (!this.c.saveState.colReorder) {
                this.s.savedState.ColReorder = undefined;
            }
            // Scroller
            if (!this.c.saveState.scroller) {
                this.s.savedState.scroller = undefined;
                if (dataTable$1.Scroller !== undefined) {
                    this.s.savedState.start = 0;
                }
            }
            // Paging
            if (!this.c.saveState.paging) {
                this.s.savedState.start = 0;
            }
            // Page Length
            if (!this.c.saveState.length) {
                this.s.savedState.length = undefined;
            }
            this.s.savedState.c = this.c;
            // Need to remove the parent reference before we save the state
            // Its not needed to rebuild, but it does cause a circular reference when converting to JSON
            if (this.s.savedState.c.splitSecondaries.length) {
                for (var _i = 0, _b = this.s.savedState.c.splitSecondaries; _i < _b.length; _i++) {
                    var secondary = _b[_i];
                    if (secondary.parent) {
                        secondary.parent = undefined;
                    }
                }
            }
            // If the state is predefined there is no need to save it over ajax or to local storage
            if (this.s.isPreDefined) {
                if (passedSuccessCallback) {
                    passedSuccessCallback.call(this);
                }
                return;
            }
            var ajaxData = {
                action: 'save',
                stateRestore: (_a = {},
                    _a[this.s.identifier] = this.s.savedState,
                    _a)
            };
            var successCallback = function () {
                if (passedSuccessCallback) {
                    passedSuccessCallback.call(_this);
                }
                _this.dom.confirmation.trigger('dtsr-save');
                $$2(_this.s.dt.table().node()).trigger('stateRestore-change');
            };
            if (!this.c.ajax) {
                localStorage.setItem('DataTables_stateRestore_' + this.s.identifier + '_' + location.pathname +
                    (this.s.tableId ? '_' + this.s.tableId : ''), JSON.stringify(this.s.savedState));
                successCallback();
            }
            else if (typeof this.c.ajax === 'string' && callAjax) {
                if (this.s.dt.settings()[0]._bInitComplete) {
                    $$2.ajax({
                        data: ajaxData,
                        success: successCallback,
                        type: 'POST',
                        url: this.c.ajax
                    });
                }
                else {
                    this.s.dt.one('init', function () {
                        $$2.ajax({
                            data: ajaxData,
                            success: successCallback,
                            type: 'POST',
                            url: _this.c.ajax
                        });
                    });
                }
            }
            else if (typeof this.c.ajax === 'function' && callAjax) {
                this.c.ajax.call(this.s.dt, ajaxData, successCallback);
            }
        };
        /**
         * Encode HTML entities
         *
         * @param d String to encode
         * @returns Encoded string
         * @todo When DT1 support is dropped, switch to using `DataTable.util.escapeHtml`
         */
        StateRestore.entityEncode = function (d) {
            return typeof d === 'string' ?
                d
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;') :
                d;
        };
        /**
         * Performs a deep compare of two state objects, returning true if they match
         *
         * @param state1 The first object to compare
         * @param state2 The second object to compare
         * @returns boolean indicating if the objects match
         */
        StateRestore.prototype._deepCompare = function (state1, state2) {
            // Put keys and states into arrays as this makes the later code easier to work
            var states = [state1, state2];
            var keys = [Object.keys(state1).sort(), Object.keys(state2).sort()];
            var startIdx, i;
            // If scroller is included then we need to remove the start value
            //  as it can be different but yield the same results
            if (keys[0].includes('scroller')) {
                startIdx = keys[0].indexOf('start');
                if (startIdx) {
                    keys[0].splice(startIdx, 1);
                }
            }
            if (keys[1].includes('scroller')) {
                startIdx = keys[1].indexOf('start');
                if (startIdx) {
                    keys[1].splice(startIdx, 1);
                }
            }
            // We want to remove any private properties within the states
            for (i = 0; i < keys[0].length; i++) {
                if (keys[0][i].indexOf('_') === 0) {
                    keys[0].splice(i, 1);
                    i--;
                    continue;
                }
                // If scroller is included then we need to remove the following values
                //  as they can be different but yield the same results
                if (keys[0][i] === 'baseRowTop' ||
                    keys[0][i] === 'baseScrollTop' ||
                    keys[0][i] === 'scrollTop' ||
                    (!this.c.saveState.paging && keys[0][i] === 'page')) {
                    keys[0].splice(i, 1);
                    i--;
                    continue;
                }
            }
            for (i = 0; i < keys[1].length; i++) {
                if (keys[1][i].indexOf('_') === 0) {
                    keys[1].splice(i, 1);
                    i--;
                    continue;
                }
                if (keys[1][i] === 'baseRowTop' ||
                    keys[1][i] === 'baseScrollTop' ||
                    keys[1][i] === 'scrollTop' ||
                    (!this.c.saveState.paging && keys[0][i] === 'page')) {
                    keys[1].splice(i, 1);
                    i--;
                    continue;
                }
            }
            if (keys[0].length === 0 && keys[1].length > 0 ||
                keys[1].length === 0 && keys[0].length > 0) {
                return false;
            }
            // We are only going to compare the keys that are common between both states
            for (i = 0; i < keys[0].length; i++) {
                if (!keys[1].includes(keys[0][i])) {
                    keys[0].splice(i, 1);
                    i--;
                }
            }
            for (i = 0; i < keys[1].length; i++) {
                if (!keys[0].includes(keys[1][i])) {
                    keys[1].splice(i, 1);
                    i--;
                }
            }
            // Then each key and value has to be checked against each other
            for (i = 0; i < keys[0].length; i++) {
                // If the keys dont equal, or their corresponding types are different we can return false
                if (keys[0][i] !== keys[1][i] || typeof states[0][keys[0][i]] !== typeof states[1][keys[1][i]]) {
                    return false;
                }
                // If the type is an object then further deep comparisons are required
                if (typeof states[0][keys[0][i]] === 'object') {
                    if (!this._deepCompare(states[0][keys[0][i]], states[1][keys[1][i]])) {
                        return false;
                    }
                }
                else if (typeof states[0][keys[0][i]] === 'number' && typeof states[1][keys[1][i]] === 'number') {
                    if (Math.round(states[0][keys[0][i]]) !== Math.round(states[1][keys[1][i]])) {
                        return false;
                    }
                }
                // Otherwise we can just check the value
                else if (states[0][keys[0][i]] !== states[1][keys[1][i]]) {
                    return false;
                }
            }
            // If we get all the way to here there are no differences so return true for this object
            return true;
        };
        StateRestore.prototype._keyupFunction = function (e) {
            // If enter same action as pressing the button
            if (e.key === 'Enter') {
                this.dom.confirmationButton.click();
            }
            // If escape close modal
            else if (e.key === 'Escape') {
                $$2('div.' + this.classes.background.replace(/ /g, '.')).click();
            }
        };
        /**
         * Creates a new confirmation modal for the user to approve an action
         *
         * @param title The title that is to be displayed at the top of the modal
         * @param buttonText The text that is to be displayed in the confirmation button of the modal
         * @param buttonAction The action that should be taken when the confirmation button is pressed
         * @param modalContents The contents for the main body of the modal
         */
        StateRestore.prototype._newModal = function (title, buttonText, buttonAction, modalContents) {
            var _this = this;
            this.dom.background.appendTo(this.dom.dtContainer);
            this.dom.confirmationTitleRow.empty().append(title);
            this.dom.confirmationButton.html(buttonText);
            this.dom.confirmation
                .empty()
                .append(this.dom.confirmationTitleRow)
                .append(modalContents)
                .append($$2('<div class="' + this.classes.confirmationButtons + '"></div>')
                .append(this.dom.confirmationButton))
                .appendTo(this.dom.dtContainer);
            $$2(this.s.dt.table().node()).trigger('dtsr-modal-inserted');
            var inputs = modalContents.children('input');
            // If there is an input focus on that
            if (inputs.length > 0) {
                $$2(inputs[0]).focus();
            }
            // Otherwise focus on the confirmation button
            else {
                this.dom.confirmationButton.focus();
            }
            var background = $$2('div.' + this.classes.background.replace(/ /g, '.'));
            if (this.c.modalCloseButton) {
                this.dom.confirmation.append(this.dom.closeButton);
                this.dom.closeButton.on('click', function () { return background.click(); });
            }
            // When the button is clicked, call the appropriate action,
            // remove the background and modal from the screen and unbind the keyup event.
            this.dom.confirmationButton.on('click', function () { return buttonAction(); });
            this.dom.confirmation.on('click', function (e) {
                e.stopPropagation();
            });
            // When the button is clicked, remove the background and modal from the screen and unbind the keyup event.
            background.one('click', function () {
                _this.dom.background.remove();
                _this.dom.confirmation.remove();
                $$2(document).unbind('keyup', function (e) { return _this._keyupFunction(e); });
            });
            $$2(document).on('keyup', function (e) { return _this._keyupFunction(e); });
        };
        StateRestore.version = '1.4.1';
        StateRestore.classes = {
            background: 'dtsr-background',
            closeButton: 'dtsr-popover-close',
            confirmation: 'dtsr-confirmation',
            confirmationButton: 'dtsr-confirmation-button',
            confirmationButtons: 'dtsr-confirmation-buttons',
            confirmationMessage: 'dtsr-confirmation-message dtsr-name-label',
            confirmationText: 'dtsr-confirmation-text',
            confirmationTitle: 'dtsr-confirmation-title',
            confirmationTitleRow: 'dtsr-confirmation-title-row',
            dtButton: 'dt-button',
            input: 'dtsr-input',
            modalError: 'dtsr-modal-error',
            renameModal: 'dtsr-rename-modal'
        };
        StateRestore.defaults = {
            _createInSaved: false,
            ajax: false,
            create: true,
            creationModal: false,
            i18n: {
                creationModal: {
                    button: 'Create',
                    colReorder: 'Column Order:',
                    columns: {
                        search: 'Column Search:',
                        visible: 'Column Visibility:'
                    },
                    length: 'Page Length:',
                    name: 'Name:',
                    order: 'Sorting:',
                    paging: 'Paging:',
                    scroller: 'Scroll Position:',
                    search: 'Search:',
                    searchBuilder: 'SearchBuilder:',
                    searchPanes: 'SearchPanes:',
                    select: 'Select:',
                    title: 'Create New State',
                    toggleLabel: 'Includes:'
                },
                duplicateError: 'A state with this name already exists.',
                emptyError: 'Name cannot be empty.',
                emptyStates: 'No saved states',
                removeConfirm: 'Are you sure you want to remove %s?',
                removeError: 'Failed to remove state.',
                removeJoiner: ' and ',
                removeSubmit: 'Remove',
                removeTitle: 'Remove State',
                renameButton: 'Rename',
                renameLabel: 'New Name for %s:',
                renameTitle: 'Rename State'
            },
            modalCloseButton: true,
            remove: true,
            rename: true,
            save: true,
            saveState: {
                colReorder: true,
                columns: {
                    search: true,
                    visible: true
                },
                length: true,
                order: true,
                paging: true,
                scroller: true,
                search: true,
                searchBuilder: true,
                searchPanes: true,
                select: true
            },
            splitSecondaries: [
                'updateState',
                'renameState',
                'removeState'
            ],
            toggle: {
                colReorder: false,
                columns: {
                    search: false,
                    visible: false
                },
                length: false,
                order: false,
                paging: false,
                scroller: false,
                search: false,
                searchBuilder: false,
                searchPanes: false,
                select: false
            }
        };
        return StateRestore;
    }());

    var $$1;
    var dataTable;
    function setJQuery(jq) {
        $$1 = jq;
        dataTable = jq.fn.dataTable;
    }
    var StateRestoreCollection = /** @class */ (function () {
        function StateRestoreCollection(settings, opts) {
            var _this = this;
            // Check that the required version of DataTables is included
            if (!dataTable || !dataTable.versionCheck || !dataTable.versionCheck('1.10.0')) {
                throw new Error('StateRestore requires DataTables 1.10 or newer');
            }
            // Check that Select is included
            // eslint-disable-next-line no-extra-parens
            if (!dataTable.Buttons) {
                throw new Error('StateRestore requires Buttons');
            }
            var table = new dataTable.Api(settings);
            this.classes = $$1.extend(true, {}, StateRestoreCollection.classes);
            if (table.settings()[0]._stateRestore !== undefined) {
                return;
            }
            // Get options from user
            this.c = $$1.extend(true, {}, StateRestoreCollection.defaults, opts);
            this.s = {
                dt: table,
                hasColReorder: dataTable.ColReorder !== undefined,
                hasScroller: dataTable.Scroller !== undefined,
                hasSearchBuilder: dataTable.SearchBuilder !== undefined,
                hasSearchPanes: dataTable.SearchPanes !== undefined,
                hasSelect: dataTable.select !== undefined,
                states: []
            };
            this.s.dt.on('xhr', function (e, xhrsettings, json) {
                // Has staterestore been used before? Is there anything to load?
                if (json && json.stateRestore) {
                    _this._addPreDefined(json.stateRestore);
                }
            });
            this.dom = {
                background: $$1('<div class="' + this.classes.background + '"/>'),
                checkboxInputRow: $$1('<div class="' + this.classes.formRow + '">' +
                    '<label class="' + this.classes.nameLabel + '">' +
                    this.s.dt.i18n('stateRestore.creationModal.toggleLabel', this.c.i18n.creationModal.toggleLabel) +
                    '</label>' +
                    '<div class="dtsr-input"></div>' +
                    '</div>'),
                closeButton: $$1('<div class="' + this.classes.closeButton + '">x</div>'),
                colReorderToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.colReorderToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.colReorder', this.c.i18n.creationModal.colReorder) +
                    '</div>'),
                columnsSearchToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.columnsSearchToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.columns.search', this.c.i18n.creationModal.columns.search) +
                    '</div>'),
                columnsVisibleToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.columnsVisibleToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.columns.visible', this.c.i18n.creationModal.columns.visible) +
                    '</div>'),
                confirmation: $$1('<div class="' + this.classes.confirmation + '"/>'),
                confirmationTitleRow: $$1('<div class="' + this.classes.confirmationTitleRow + '"></div>'),
                createButtonRow: $$1('<div class="' + this.classes.formRow + ' ' + this.classes.modalFoot + '">' +
                    '<button class="' + this.classes.creationButton + ' ' + this.classes.dtButton + '">' +
                    this.s.dt.i18n('stateRestore.creationModal.button', this.c.i18n.creationModal.button) +
                    '</button>' +
                    '</div>'),
                creation: $$1('<div class="' + this.classes.creation + '"/>'),
                creationForm: $$1('<div class="' + this.classes.creationForm + '"/>'),
                creationTitle: $$1('<div class="' + this.classes.creationText + '">' +
                    '<h2 class="' + this.classes.creationTitle + '">' +
                    this.s.dt.i18n('stateRestore.creationModal.title', this.c.i18n.creationModal.title) +
                    '</h2>' +
                    '</div>'),
                dtContainer: $$1(this.s.dt.table().container()),
                duplicateError: $$1('<span class="' + this.classes.modalError + '">' +
                    this.s.dt.i18n('stateRestore.duplicateError', this.c.i18n.duplicateError) +
                    '</span>'),
                emptyError: $$1('<span class="' + this.classes.modalError + '">' +
                    this.s.dt.i18n('stateRestore.emptyError', this.c.i18n.emptyError) +
                    '</span>'),
                lengthToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.lengthToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.length', this.c.i18n.creationModal.length) +
                    '</div>'),
                nameInputRow: $$1('<div class="' + this.classes.formRow + '">' +
                    '<label class="' + this.classes.nameLabel + '">' +
                    this.s.dt.i18n('stateRestore.creationModal.name', this.c.i18n.creationModal.name) +
                    '</label>' +
                    '<div class="dtsr-input">' +
                    '<input class="' + this.classes.nameInput + '" type="text">' +
                    '</div>' +
                    '</div>'),
                orderToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.orderToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.order', this.c.i18n.creationModal.order) +
                    '</div>'),
                pagingToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.pagingToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.paging', this.c.i18n.creationModal.paging) +
                    '</div>'),
                removeContents: $$1('<div class="' + this.classes.confirmationText + '"><span></span></div>'),
                removeTitle: $$1('<div class="' + this.classes.creationText + '">' +
                    '<h2 class="' + this.classes.creationTitle + '">' +
                    this.s.dt.i18n('stateRestore.removeTitle', this.c.i18n.removeTitle) +
                    '</h2>' +
                    '</div>'),
                scrollerToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.scrollerToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.scroller', this.c.i18n.creationModal.scroller) +
                    '</div>'),
                searchBuilderToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.searchBuilderToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.searchBuilder', this.c.i18n.creationModal.searchBuilder) +
                    '</div>'),
                searchPanesToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.searchPanesToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.searchPanes', this.c.i18n.creationModal.searchPanes) +
                    '</div>'),
                searchToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.searchToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.search', this.c.i18n.creationModal.search) +
                    '</div>'),
                selectToggle: $$1('<div class="' + this.classes.checkLabel + '">' +
                    '<input type="checkbox" class="' +
                    this.classes.selectToggle + ' ' +
                    this.classes.checkBox +
                    '" checked>' +
                    this.s.dt.i18n('stateRestore.creationModal.select', this.c.i18n.creationModal.select) +
                    '</div>')
            };
            table.settings()[0]._stateRestore = this;
            this._searchForStates();
            // Has staterestore been used before? Is there anything to load?
            this._addPreDefined(this.c.preDefined);
            var ajaxFunction;
            var ajaxData = {
                action: 'load'
            };
            if (typeof this.c.ajax === 'function') {
                ajaxFunction = function () {
                    if (typeof _this.c.ajax === 'function') {
                        _this.c.ajax.call(_this.s.dt, ajaxData, function (s) { return _this._addPreDefined(s); });
                    }
                };
            }
            else if (typeof this.c.ajax === 'string') {
                ajaxFunction = function () {
                    $$1.ajax({
                        data: ajaxData,
                        success: function (data) {
                            _this._addPreDefined(data);
                        },
                        type: 'POST',
                        url: _this.c.ajax
                    });
                };
            }
            if (typeof ajaxFunction === 'function') {
                if (this.s.dt.settings()[0]._bInitComplete) {
                    ajaxFunction();
                }
                else {
                    this.s.dt.one('preInit.dtsr', function () {
                        ajaxFunction();
                    });
                }
            }
            this.s.dt.on('destroy.dtsr', function () {
                _this.destroy();
            });
            this.s.dt.on('draw.dtsr buttons-action.dtsr', function () { return _this.findActive(); });
            return this;
        }
        /**
         * Adds a new StateRestore instance to the collection based on the current properties of the table
         *
         * @param identifier The value that is used to identify a state.
         * @returns The state that has been created
         */
        StateRestoreCollection.prototype.addState = function (identifier, currentIdentifiers, options) {
            var _this = this;
            // If creation/saving is not allowed then return
            if (!this.c.create || !this.c.save) {
                return;
            }
            // Check if the state exists before creating a new ones
            var state = this.getState(identifier);
            var createFunction = function (id, toggles) {
                if (id.length === 0) {
                    return 'empty';
                }
                else if (currentIdentifiers.includes(id)) {
                    return 'duplicate';
                }
                _this.s.dt.state.save();
                var that = _this;
                var successCallback = function () {
                    that.s.states.push(this);
                    that._collectionRebuild();
                };
                var currState = _this.s.dt.state();
                currState.stateRestore = {
                    isPredefined: false,
                    state: id,
                    tableId: _this.s.dt.table().node().id
                };
                if (toggles.saveState) {
                    var opts = _this.c.saveState;
                    // We don't want to extend, but instead AND all properties of the saveState option
                    for (var _i = 0, _a = Object.keys(toggles.saveState); _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (typeof toggles.saveState[key] === 'object') {
                            for (var _b = 0, _c = Object.keys(toggles.saveState[key]); _b < _c.length; _b++) {
                                var nestedKey = _c[_b];
                                if (!toggles.saveState[key][nestedKey]) {
                                    opts[key][nestedKey] = false;
                                }
                            }
                        }
                        else if (!toggles.saveState[key]) {
                            opts[key] = false;
                        }
                    }
                    _this.c.saveState = opts;
                }
                var newState = new StateRestore(_this.s.dt.settings()[0], $$1.extend(true, {}, _this.c, options), id, currState, false, successCallback);
                $$1(_this.s.dt.table().node()).on('dtsr-modal-inserted', function () {
                    newState.dom.confirmation.one('dtsr-remove', function () { return _this._removeCallback(newState.s.identifier); });
                    newState.dom.confirmation.one('dtsr-rename', function () { return _this._collectionRebuild(); });
                    newState.dom.confirmation.one('dtsr-save', function () { return _this._collectionRebuild(); });
                });
                return true;
            };
            // If there isn't already a state with this identifier
            if (state === null) {
                if (this.c.creationModal || options !== undefined && options.creationModal) {
                    this._creationModal(createFunction, identifier, options);
                }
                else {
                    var success = createFunction(identifier, {});
                    if (success === 'empty') {
                        throw new Error(this.s.dt.i18n('stateRestore.emptyError', this.c.i18n.emptyError));
                    }
                    else if (success === 'duplicate') {
                        throw new Error(this.s.dt.i18n('stateRestore.duplicateError', this.c.i18n.duplicateError));
                    }
                }
            }
            else {
                throw new Error(this.s.dt.i18n('stateRestore.duplicateError', this.c.i18n.duplicateError));
            }
        };
        /**
         * Removes all of the states, showing a modal to the user for confirmation
         *
         * @param removeFunction The action to be taken when the action is confirmed
         */
        StateRestoreCollection.prototype.removeAll = function (removeFunction) {
            // There are no states to remove so just return
            if (this.s.states.length === 0) {
                return;
            }
            var ids = this.s.states.map(function (state) { return state.s.identifier; });
            var replacementString = ids[0];
            if (ids.length > 1) {
                replacementString = ids.slice(0, -1).join(', ') +
                    this.s.dt.i18n('stateRestore.removeJoiner', this.c.i18n.removeJoiner) +
                    ids.slice(-1);
            }
            $$1(this.dom.removeContents.children('span')).html(this.s.dt
                .i18n('stateRestore.removeConfirm', this.c.i18n.removeConfirm)
                .replace(/%s/g, replacementString));
            this._newModal(this.dom.removeTitle, this.s.dt.i18n('stateRestore.removeSubmit', this.c.i18n.removeSubmit), removeFunction, this.dom.removeContents);
        };
        /**
         * Removes all of the dom elements from the document for the collection and the stored states
         */
        StateRestoreCollection.prototype.destroy = function () {
            for (var _i = 0, _a = this.s.states; _i < _a.length; _i++) {
                var state = _a[_i];
                state.destroy();
            }
            $$1.each(this.dom, function (name, el) {
                el.off().remove();
            });
            this.s.states = [];
            this.s.dt.off('.dtsr');
            $$1(this.s.dt.table().node()).off('.dtsr');
        };
        /**
         * Identifies active states and updates their button to reflect this.
         *
         * @returns An array containing objects with the details of currently active states
         */
        StateRestoreCollection.prototype.findActive = function () {
            // Make sure that the state is up to date
            this.s.dt.state.save();
            var currState = this.s.dt.state();
            var button;
            // Make all of the buttons inactive so that only any that match will be marked as active
            var buttons = this.s.dt.buttons().nodes();
            for (var _i = 0, buttons_1 = buttons; _i < buttons_1.length; _i++) {
                button = buttons_1[_i];
                if ($$1(button).hasClass('dtsr-state') || $$1(button).children().hasClass('dtsr-state')) {
                    this.s.dt.button(button).active(false);
                }
            }
            var results = [];
            // Go through all of the states comparing if their state is the same to the current one
            for (var _a = 0, _b = this.s.states; _a < _b.length; _a++) {
                var state = _b[_a];
                if (state.compare(currState)) {
                    results.push({
                        data: state.s.savedState,
                        name: state.s.identifier
                    });
                    // If so, find the corresponding button and mark it as active
                    for (var _c = 0, buttons_2 = buttons; _c < buttons_2.length; _c++) {
                        button = buttons_2[_c];
                        var btn = this.s.dt.button(button);
                        if (btn.text() === state.s.identifier) {
                            btn.active(true);
                            break;
                        }
                    }
                }
            }
            return results;
        };
        /**
         * Gets a single state that has the identifier matching that which is passed in
         *
         * @param identifier The value that is used to identify a state
         * @returns The state that has been identified or null if no states have been identified
         */
        StateRestoreCollection.prototype.getState = function (identifier) {
            for (var _i = 0, _a = this.s.states; _i < _a.length; _i++) {
                var state = _a[_i];
                if (state.s.identifier === identifier) {
                    return state;
                }
            }
            return null;
        };
        /**
         * Gets an array of all of the states
         *
         * @returns Any states that have been identified
         */
        StateRestoreCollection.prototype.getStates = function (ids) {
            if (ids === undefined) {
                return this.s.states;
            }
            else {
                var states = [];
                for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                    var id = ids_1[_i];
                    var found = false;
                    for (var _a = 0, _b = this.s.states; _a < _b.length; _a++) {
                        var state = _b[_a];
                        if (id === state.s.identifier) {
                            states.push(state);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        states.push(undefined);
                    }
                }
                return states;
            }
        };
        /**
         * Reloads states that are set via datatables config or over ajax
         *
         * @param preDefined Object containing the predefined states that are to be reintroduced
         */
        StateRestoreCollection.prototype._addPreDefined = function (preDefined) {
            var _this = this;
            // There is a potential issue here if sorting where the string parts of the name are the same,
            // only the number differs and there are many states - but this wouldn't be usfeul naming so
            // more of a priority to sort alphabetically
            var states = Object.keys(preDefined).sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0; });
            var _loop_1 = function (state) {
                for (var i = 0; i < this_1.s.states.length; i++) {
                    if (this_1.s.states[i].s.identifier === state) {
                        this_1.s.states.splice(i, 1);
                    }
                }
                var that = this_1;
                var successCallback = function () {
                    that.s.states.push(this);
                    that._collectionRebuild();
                };
                var loadedState = preDefined[state];
                var newState = new StateRestore(this_1.s.dt, $$1.extend(true, {}, this_1.c, loadedState.c !== undefined ?
                    { saveState: loadedState.c.saveState } :
                    undefined, true), state, loadedState, true, successCallback);
                newState.s.savedState = loadedState;
                $$1(this_1.s.dt.table().node()).on('dtsr-modal-inserted', function () {
                    newState.dom.confirmation.one('dtsr-remove', function () { return _this._removeCallback(newState.s.identifier); });
                    newState.dom.confirmation.one('dtsr-rename', function () { return _this._collectionRebuild(); });
                    newState.dom.confirmation.one('dtsr-save', function () { return _this._collectionRebuild(); });
                });
            };
            var this_1 = this;
            for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
                var state = states_1[_i];
                _loop_1(state);
            }
        };
        /**
         * Rebuilds all of the buttons in the collection of states to make sure that states and text is up to date
         */
        StateRestoreCollection.prototype._collectionRebuild = function () {
            var button = this.s.dt.button('SaveStateRestore:name');
            var stateButtons = [];
            var i;
            // Need to get the original configuration object, so we can rebuild it
            // It might be nested, so need to traverse down the tree
            if (button[0]) {
                var idxs = button.index().split('-');
                stateButtons = button[0].inst.c.buttons;
                for (i = 0; i < idxs.length; i++) {
                    if (stateButtons[idxs[i]].buttons) {
                        stateButtons = stateButtons[idxs[i]].buttons;
                    }
                    else {
                        stateButtons = [];
                        break;
                    }
                }
            }
            // remove any states from the previous rebuild - if they are still there they will be added later
            for (i = 0; i < stateButtons.length; i++) {
                if (stateButtons[i].extend === 'stateRestore') {
                    stateButtons.splice(i, 1);
                    i--;
                }
            }
            if (this.c._createInSaved) {
                stateButtons.push('createState');
            }
            var emptyText = '<span class="' + this.classes.emptyStates + '">' +
                this.s.dt.i18n('stateRestore.emptyStates', this.c.i18n.emptyStates) +
                '</span>';
            // If there are no states display an empty message
            if (this.s.states.length === 0) {
                // Don't want the empty text included more than twice
                if (!stateButtons.includes(emptyText)) {
                    stateButtons.push(emptyText);
                }
            }
            else {
                // There are states to add so there shouldn't be any empty text left!
                while (stateButtons.includes(emptyText)) {
                    stateButtons.splice(stateButtons.indexOf(emptyText), 1);
                }
                // There is a potential issue here if sorting where the string parts of the name are the same,
                // only the number differs and there are many states - but this wouldn't be usfeul naming so
                // more of a priority to sort alphabetically
                this.s.states = this.s.states.sort(function (a, b) {
                    var aId = a.s.identifier;
                    var bId = b.s.identifier;
                    return aId > bId ?
                        1 :
                        aId < bId ?
                            -1 :
                            0;
                });
                // Construct the split property of each button
                for (var _i = 0, _a = this.s.states; _i < _a.length; _i++) {
                    var state = _a[_i];
                    var split = this.c.splitSecondaries.slice();
                    if (split.includes('updateState') && (!this.c.save || !state.c.save)) {
                        split.splice(split.indexOf('updateState'), 1);
                    }
                    if (split.includes('renameState') &&
                        (!this.c.save || !state.c.save || !this.c.rename || !state.c.rename)) {
                        split.splice(split.indexOf('renameState'), 1);
                    }
                    if (split.includes('removeState') && (!this.c.remove || !state.c.remove)) {
                        split.splice(split.indexOf('removeState'), 1);
                    }
                    stateButtons.push({
                        _stateRestore: state,
                        attr: {
                            title: state.s.identifier
                        },
                        config: {
                            split: split
                        },
                        extend: 'stateRestore',
                        text: StateRestore.entityEncode(state.s.identifier),
                        popoverTitle: StateRestore.entityEncode(state.s.identifier)
                    });
                }
            }
            button.collectionRebuild(stateButtons);
            // Need to disable the removeAllStates button if there are no states and it is present
            var buttons = this.s.dt.buttons();
            for (var _b = 0, buttons_3 = buttons; _b < buttons_3.length; _b++) {
                var butt = buttons_3[_b];
                if ($$1(butt.node).hasClass('dtsr-removeAllStates')) {
                    if (this.s.states.length === 0) {
                        this.s.dt.button(butt.node).disable();
                    }
                    else {
                        this.s.dt.button(butt.node).enable();
                    }
                }
            }
        };
        /**
         * Displays a modal that is used to get information from the user to create a new state.
         *
         * @param buttonAction The action that should be taken when the button is pressed
         * @param identifier The default identifier for the next new state
         */
        StateRestoreCollection.prototype._creationModal = function (buttonAction, identifier, options) {
            var _this = this;
            this.dom.creation.empty();
            this.dom.creationForm.empty();
            this.dom.nameInputRow.find('input').val(identifier);
            this.dom.creationForm.append(this.dom.nameInputRow);
            var tableConfig = this.s.dt.settings()[0].oInit;
            var toggle;
            var togglesToInsert = [];
            var toggleDefined = options !== undefined && options.toggle !== undefined;
            // Order toggle - check toggle and saving enabled
            if (((!toggleDefined || options.toggle.order === undefined) && this.c.toggle.order ||
                toggleDefined && options.toggle.order) &&
                this.c.saveState.order &&
                (tableConfig.ordering === undefined || tableConfig.ordering)) {
                togglesToInsert.push(this.dom.orderToggle);
            }
            // Search toggle - check toggle and saving enabled
            if (((!toggleDefined || options.toggle.search === undefined) && this.c.toggle.search ||
                toggleDefined && options.toggle.search) &&
                this.c.saveState.search &&
                (tableConfig.searching === undefined || tableConfig.searching)) {
                togglesToInsert.push(this.dom.searchToggle);
            }
            // Paging toggle - check toggle and saving enabled
            if (((!toggleDefined || options.toggle.paging === undefined) && this.c.toggle.paging ||
                toggleDefined && options.toggle.paging) &&
                this.c.saveState.paging &&
                (tableConfig.paging === undefined || tableConfig.paging)) {
                togglesToInsert.push(this.dom.pagingToggle);
            }
            // Page Length toggle - check toggle and saving enabled
            if (((!toggleDefined || options.toggle.length === undefined) && this.c.toggle.length ||
                toggleDefined && options.toggle.length) &&
                this.c.saveState.length &&
                (tableConfig.length === undefined || tableConfig.length)) {
                togglesToInsert.push(this.dom.lengthToggle);
            }
            // ColReorder toggle - check toggle and saving enabled
            if (this.s.hasColReorder &&
                ((!toggleDefined || options.toggle.colReorder === undefined) && this.c.toggle.colReorder ||
                    toggleDefined && options.toggle.colReorder) &&
                this.c.saveState.colReorder) {
                togglesToInsert.push(this.dom.colReorderToggle);
            }
            // Scroller toggle - check toggle and saving enabled
            if (this.s.hasScroller &&
                ((!toggleDefined || options.toggle.scroller === undefined) && this.c.toggle.scroller ||
                    toggleDefined && options.toggle.scroller) &&
                this.c.saveState.scroller) {
                togglesToInsert.push(this.dom.scrollerToggle);
            }
            // SearchBuilder toggle - check toggle and saving enabled
            if (this.s.hasSearchBuilder &&
                ((!toggleDefined || options.toggle.searchBuilder === undefined) && this.c.toggle.searchBuilder ||
                    toggleDefined && options.toggle.searchBuilder) &&
                this.c.saveState.searchBuilder) {
                togglesToInsert.push(this.dom.searchBuilderToggle);
            }
            // SearchPanes toggle - check toggle and saving enabled
            if (this.s.hasSearchPanes &&
                ((!toggleDefined || options.toggle.searchPanes === undefined) && this.c.toggle.searchPanes ||
                    toggleDefined && options.toggle.searchPanes) &&
                this.c.saveState.searchPanes) {
                togglesToInsert.push(this.dom.searchPanesToggle);
            }
            // Select toggle - check toggle and saving enabled
            if (this.s.hasSelect &&
                ((!toggleDefined || options.toggle.select === undefined) && this.c.toggle.select ||
                    toggleDefined && options.toggle.select) &&
                this.c.saveState.select) {
                togglesToInsert.push(this.dom.selectToggle);
            }
            // Columns toggle - check toggle and saving enabled
            if (typeof this.c.toggle.columns === 'boolean' &&
                ((!toggleDefined || options.toggle.order === undefined) && this.c.toggle.columns ||
                    toggleDefined && options.toggle.order) &&
                this.c.saveState.columns) {
                togglesToInsert.push(this.dom.columnsSearchToggle);
                togglesToInsert.push(this.dom.columnsVisibleToggle);
            }
            else if ((!toggleDefined || options.toggle.columns === undefined) && typeof this.c.toggle.columns !== 'boolean' ||
                typeof options.toggle.order !== 'boolean') {
                if (typeof this.c.saveState.columns !== 'boolean' && this.c.saveState.columns) {
                    // Column search toggle - check toggle and saving enabled
                    if ((
                    // columns.search is defined when passed in
                    toggleDefined &&
                        options.toggle.columns !== undefined &&
                        typeof options.toggle.columns !== 'boolean' &&
                        options.toggle.columns.search ||
                        // Columns search is not defined when passed in but is in defaults
                        (!toggleDefined ||
                            options.toggle.columns === undefined ||
                            typeof options.toggle.columns !== 'boolean' && options.toggle.columns.search === undefined) &&
                            typeof this.c.toggle.columns !== 'boolean' &&
                            this.c.toggle.columns.search) &&
                        this.c.saveState.columns.search) {
                        togglesToInsert.push(this.dom.columnsSearchToggle);
                    }
                    // Column visiblity toggle - check toggle and saving enabled
                    if ((
                    // columns.visible is defined when passed in
                    toggleDefined &&
                        options.toggle.columns !== undefined &&
                        typeof options.toggle.columns !== 'boolean' &&
                        options.toggle.columns.visible ||
                        // Columns visible is not defined when passed in but is in defaults
                        (!toggleDefined ||
                            options.toggle.columns === undefined ||
                            typeof options.toggle.columns !== 'boolean' && options.toggle.columns.visible === undefined) &&
                            typeof this.c.toggle.columns !== 'boolean' &&
                            this.c.toggle.columns.visible) &&
                        this.c.saveState.columns.visible) {
                        togglesToInsert.push(this.dom.columnsVisibleToggle);
                    }
                }
                else if (this.c.saveState.columns) {
                    togglesToInsert.push(this.dom.columnsSearchToggle);
                    togglesToInsert.push(this.dom.columnsVisibleToggle);
                }
            }
            // Make sure that the toggles are displayed alphabetically
            togglesToInsert.sort(function (a, b) {
                var aVal = a.text();
                var bVal = b.text();
                if (aVal < bVal) {
                    return -1;
                }
                else if (aVal > bVal) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            // Append all of the toggles that are to be inserted
            var checkboxesEl = this.dom.checkboxInputRow
                .appendTo(this.dom.creationForm)
                .find('div.dtsr-input')
                .empty();
            // let checkboxes = $('<div class="'+this.classes.formRow+' '+this.classes.checkRow+'"></div>')
            // 	.appendTo(this.dom.creationForm);
            for (var _i = 0, togglesToInsert_1 = togglesToInsert; _i < togglesToInsert_1.length; _i++) {
                toggle = togglesToInsert_1[_i];
                checkboxesEl.append(toggle);
            }
            // Insert the toggle label next to the first check box
            // $(this.dom.creationForm.children('div.'+this.classes.checkRow)[0]).prepend(this.dom.toggleLabel);
            // Insert the creation modal and the background
            this.dom.background.appendTo(this.dom.dtContainer);
            this.dom.creation
                .append(this.dom.creationTitle)
                .append(this.dom.creationForm)
                .append(this.dom.createButtonRow)
                .appendTo(this.dom.dtContainer);
            $$1(this.s.dt.table().node()).trigger('dtsr-modal-inserted');
            // Allow the label to be clicked to toggle the checkbox
            for (var _a = 0, togglesToInsert_2 = togglesToInsert; _a < togglesToInsert_2.length; _a++) {
                toggle = togglesToInsert_2[_a];
                $$1(toggle.children('label:last-child')).on('click', function () {
                    toggle.children('input').prop('checked', !toggle.children('input').prop('checked'));
                });
            }
            var creationButton = $$1('button.' + this.classes.creationButton.replace(/ /g, '.'));
            var inputs = this.dom.creationForm.find('input');
            // If there is an input focus on that
            if (inputs.length > 0) {
                $$1(inputs[0]).focus();
            }
            // Otherwise focus on the confirmation button
            else {
                creationButton.focus();
            }
            var background = $$1('div.' + this.classes.background.replace(/ /g, '.'));
            var keyupFunction = function (e) {
                if (e.key === 'Enter') {
                    creationButton.click();
                }
                else if (e.key === 'Escape') {
                    background.click();
                }
            };
            if (this.c.modalCloseButton) {
                this.dom.creation.append(this.dom.closeButton);
                this.dom.closeButton.on('click', function () { return background.click(); });
            }
            creationButton.on('click', function () {
                // Get the values of the checkBoxes
                var saveState = {
                    colReorder: _this.dom.colReorderToggle.find('input').is(':checked'),
                    columns: {
                        search: _this.dom.columnsSearchToggle.find('input').is(':checked'),
                        visible: _this.dom.columnsVisibleToggle.find('input').is(':checked')
                    },
                    length: _this.dom.lengthToggle.find('input').is(':checked'),
                    order: _this.dom.orderToggle.find('input').is(':checked'),
                    paging: _this.dom.pagingToggle.find('input').is(':checked'),
                    scroller: _this.dom.scrollerToggle.find('input').is(':checked'),
                    search: _this.dom.searchToggle.find('input').is(':checked'),
                    searchBuilder: _this.dom.searchBuilderToggle.find('input').is(':checked'),
                    searchPanes: _this.dom.searchPanesToggle.find('input').is(':checked'),
                    select: _this.dom.selectToggle.find('input').is(':checked')
                };
                // Call the buttons functionality passing in the identifier and what should be saved
                var success = buttonAction($$1('input.' + _this.classes.nameInput.replace(/ /g, '.')).val(), { saveState: saveState });
                if (success === true) {
                    // Remove the dom elements as operation has completed
                    _this.dom.background.remove();
                    _this.dom.creation.remove();
                    // Unbind the keyup function  - don't want it to run unnecessarily on every keypress that occurs
                    $$1(document).unbind('keyup', keyupFunction);
                }
                else {
                    _this.dom.creation.children('.' + _this.classes.modalError).remove();
                    _this.dom.creation.append(_this.dom[success + 'Error']);
                }
            });
            background.one('click', function () {
                // Remove the dome elements as operation has been cancelled
                _this.dom.background.remove();
                _this.dom.creation.remove();
                // Unbind the keyup function - don't want it to run unnecessarily on every keypress that occurs
                $$1(document).unbind('keyup', keyupFunction);
                // Rebuild the collection to ensure that the latest changes are present
                _this._collectionRebuild();
            });
            // Have to listen to the keyup event as `escape` doesn't trigger keypress
            $$1(document).on('keyup', keyupFunction);
            // Need to save the state before the focus is lost when the modal is interacted with
            this.s.dt.state.save();
        };
        /**
         * This callback is called when a state is removed.
         * This removes the state from storage and also strips it's button from the container
         *
         * @param identifier The value that is used to identify a state
         */
        StateRestoreCollection.prototype._removeCallback = function (identifier) {
            for (var i = 0; i < this.s.states.length; i++) {
                if (this.s.states[i].s.identifier === identifier) {
                    this.s.states.splice(i, 1);
                    i--;
                }
            }
            this._collectionRebuild();
            return true;
        };
        /**
         * Creates a new confirmation modal for the user to approve an action
         *
         * @param title The title that is to be displayed at the top of the modal
         * @param buttonText The text that is to be displayed in the confirmation button of the modal
         * @param buttonAction The action that should be taken when the confirmation button is pressed
         * @param modalContents The contents for the main body of the modal
         */
        StateRestoreCollection.prototype._newModal = function (title, buttonText, buttonAction, modalContents) {
            var _this = this;
            this.dom.background.appendTo(this.dom.dtContainer);
            this.dom.confirmationTitleRow.empty().append(title);
            var confirmationButton = $$1('<button class="' + this.classes.confirmationButton + ' ' + this.classes.dtButton + '">' +
                buttonText +
                '</button>');
            this.dom.confirmation
                .empty()
                .append(this.dom.confirmationTitleRow)
                .append(modalContents)
                .append($$1('<div class="' + this.classes.confirmationButtons + '"></div>')
                .append(confirmationButton))
                .appendTo(this.dom.dtContainer);
            $$1(this.s.dt.table().node()).trigger('dtsr-modal-inserted');
            var inputs = modalContents.children('input');
            // If there is an input focus on that
            if (inputs.length > 0) {
                $$1(inputs[0]).focus();
            }
            // Otherwise focus on the confirmation button
            else {
                confirmationButton.focus();
            }
            var background = $$1('div.' + this.classes.background.replace(/ /g, '.'));
            var keyupFunction = function (e) {
                // If enter same action as pressing the button
                if (e.key === 'Enter') {
                    confirmationButton.click();
                }
                // If escape close modal
                else if (e.key === 'Escape') {
                    background.click();
                }
            };
            // When the button is clicked, call the appropriate action,
            // remove the background and modal from the screen and unbind the keyup event.
            confirmationButton.on('click', function () {
                var success = buttonAction(true);
                if (success === true) {
                    _this.dom.background.remove();
                    _this.dom.confirmation.remove();
                    $$1(document).unbind('keyup', keyupFunction);
                    confirmationButton.off('click');
                }
                else {
                    _this.dom.confirmation.children('.' + _this.classes.modalError).remove();
                    _this.dom.confirmation.append(_this.dom[success + 'Error']);
                }
            });
            this.dom.confirmation.on('click', function (e) {
                e.stopPropagation();
            });
            // When the button is clicked, remove the background and modal from the screen and unbind the keyup event.
            background.one('click', function () {
                _this.dom.background.remove();
                _this.dom.confirmation.remove();
                $$1(document).unbind('keyup', keyupFunction);
            });
            $$1(document).on('keyup', keyupFunction);
        };
        /**
         * Private method that checks for previously created states on initialisation
         */
        StateRestoreCollection.prototype._searchForStates = function () {
            var _this = this;
            var keys = Object.keys(localStorage);
            var _loop_2 = function (key) {
                // eslint-disable-next-line no-useless-escape
                if (key.match(new RegExp('^DataTables_stateRestore_.*_' + location.pathname + '$')) ||
                    key.match(new RegExp('^DataTables_stateRestore_.*_' + location.pathname +
                        '_' + this_2.s.dt.table().node().id + '$'))) {
                    var loadedState_1 = JSON.parse(localStorage.getItem(key));
                    if (loadedState_1.stateRestore.isPreDefined ||
                        (loadedState_1.stateRestore.tableId &&
                            loadedState_1.stateRestore.tableId !== this_2.s.dt.table().node().id)) {
                        return "continue";
                    }
                    var that_1 = this_2;
                    var successCallback = function () {
                        this.s.savedState = loadedState_1;
                        that_1.s.states.push(this);
                        that_1._collectionRebuild();
                    };
                    var newState_1 = new StateRestore(this_2.s.dt, $$1.extend(true, {}, this_2.c, { saveState: loadedState_1.c.saveState }), loadedState_1.stateRestore.state, loadedState_1, false, successCallback);
                    $$1(this_2.s.dt.table().node()).on('dtsr-modal-inserted', function () {
                        newState_1.dom.confirmation.one('dtsr-remove', function () { return _this._removeCallback(newState_1.s.identifier); });
                        newState_1.dom.confirmation.one('dtsr-rename', function () { return _this._collectionRebuild(); });
                        newState_1.dom.confirmation.one('dtsr-save', function () { return _this._collectionRebuild(); });
                    });
                }
            };
            var this_2 = this;
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                _loop_2(key);
            }
        };
        StateRestoreCollection.version = '1.0.0';
        StateRestoreCollection.classes = {
            background: 'dtsr-background',
            checkBox: 'dtsr-check-box',
            checkLabel: 'dtsr-check-label',
            checkRow: 'dtsr-check-row',
            closeButton: 'dtsr-popover-close',
            colReorderToggle: 'dtsr-colReorder-toggle',
            columnsSearchToggle: 'dtsr-columns-search-toggle',
            columnsVisibleToggle: 'dtsr-columns-visible-toggle',
            confirmation: 'dtsr-confirmation',
            confirmationButton: 'dtsr-confirmation-button',
            confirmationButtons: 'dtsr-confirmation-buttons',
            confirmationMessage: 'dtsr-confirmation-message dtsr-name-label',
            confirmationText: 'dtsr-confirmation-text',
            confirmationTitle: 'dtsr-confirmation-title',
            confirmationTitleRow: 'dtsr-confirmation-title-row',
            creation: 'dtsr-creation',
            creationButton: 'dtsr-creation-button',
            creationForm: 'dtsr-creation-form',
            creationText: 'dtsr-creation-text',
            creationTitle: 'dtsr-creation-title',
            dtButton: 'dt-button',
            emptyStates: 'dtsr-emptyStates',
            formRow: 'dtsr-form-row',
            leftSide: 'dtsr-left',
            lengthToggle: 'dtsr-length-toggle',
            modalError: 'dtsr-modal-error',
            modalFoot: 'dtsr-modal-foot',
            nameInput: 'dtsr-name-input',
            nameLabel: 'dtsr-name-label',
            orderToggle: 'dtsr-order-toggle',
            pagingToggle: 'dtsr-paging-toggle',
            rightSide: 'dtsr-right',
            scrollerToggle: 'dtsr-scroller-toggle',
            searchBuilderToggle: 'dtsr-searchBuilder-toggle',
            searchPanesToggle: 'dtsr-searchPanes-toggle',
            searchToggle: 'dtsr-search-toggle',
            selectToggle: 'dtsr-select-toggle',
            toggleLabel: 'dtsr-toggle-title'
        };
        StateRestoreCollection.defaults = {
            _createInSaved: false,
            ajax: false,
            create: true,
            creationModal: false,
            i18n: {
                creationModal: {
                    button: 'Create',
                    colReorder: 'Column Order',
                    columns: {
                        search: 'Column Search',
                        visible: 'Column Visibility'
                    },
                    length: 'Page Length',
                    name: 'Name:',
                    order: 'Sorting',
                    paging: 'Paging',
                    scroller: 'Scroll Position',
                    search: 'Search',
                    searchBuilder: 'SearchBuilder',
                    searchPanes: 'SearchPanes',
                    select: 'Select',
                    title: 'Create New State',
                    toggleLabel: 'Include:'
                },
                duplicateError: 'A state with this name already exists.',
                emptyError: 'Name cannot be empty.',
                emptyStates: 'No saved states',
                removeConfirm: 'Are you sure you want to remove %s?',
                removeError: 'Failed to remove state.',
                removeJoiner: ' and ',
                removeSubmit: 'Remove',
                removeTitle: 'Remove State',
                renameButton: 'Rename',
                renameLabel: 'New Name for %s:',
                renameTitle: 'Rename State'
            },
            modalCloseButton: true,
            preDefined: {},
            remove: true,
            rename: true,
            save: true,
            saveState: {
                colReorder: true,
                columns: {
                    search: true,
                    visible: true
                },
                length: true,
                order: true,
                paging: true,
                scroller: true,
                search: true,
                searchBuilder: true,
                searchPanes: true,
                select: true
            },
            splitSecondaries: [
                'updateState',
                'renameState',
                'removeState'
            ],
            toggle: {
                colReorder: false,
                columns: {
                    search: false,
                    visible: false
                },
                length: false,
                order: false,
                paging: false,
                scroller: false,
                search: false,
                searchBuilder: false,
                searchPanes: false,
                select: false
            }
        };
        return StateRestoreCollection;
    }());

    /*! StateRestore 1.4.1
     * © SpryMedia Ltd - datatables.net/license
     */
    setJQuery$1($);
    setJQuery($);
    $.fn.dataTable.StateRestore = StateRestore;
    $.fn.DataTable.StateRestore = StateRestore;
    $.fn.dataTable.StateRestoreCollection = StateRestoreCollection;
    $.fn.DataTable.StateRestoreCollection = StateRestoreCollection;
    var apiRegister = DataTable.Api.register;
    apiRegister('stateRestore()', function () {
        return this;
    });
    apiRegister('stateRestore.state()', function (identifier) {
        var ctx = this.context[0];
        if (!ctx._stateRestore) {
            var api = DataTable.Api(ctx);
            var src = new DataTable.StateRestoreCollection(api, {});
            _stateRegen(api, src);
        }
        this[0] = ctx._stateRestore.getState(identifier);
        return this;
    });
    apiRegister('stateRestore.state.add()', function (identifier, options) {
        var ctx = this.context[0];
        if (!ctx._stateRestore) {
            var api = DataTable.Api(ctx);
            var src = new DataTable.StateRestoreCollection(api, {});
            _stateRegen(api, src);
        }
        if (!ctx._stateRestore.c.create) {
            return this;
        }
        if (ctx._stateRestore.addState) {
            var states = ctx._stateRestore.s.states;
            var ids = [];
            for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
                var intState = states_1[_i];
                ids.push(intState.s.identifier);
            }
            ctx._stateRestore.addState(identifier, ids, options);
            return this;
        }
    });
    apiRegister('stateRestore.states()', function (ids) {
        var ctx = this.context[0];
        if (!ctx._stateRestore) {
            var api = DataTable.Api(ctx);
            var src = new DataTable.StateRestoreCollection(api, {});
            _stateRegen(api, src);
        }
        this.length = 0;
        this.push.apply(this, ctx._stateRestore.getStates(ids));
        return this;
    });
    apiRegister('stateRestore.state().save()', function () {
        var ctx = this[0];
        // Check if saving states is allowed
        if (ctx.c.save) {
            ctx.save();
        }
        return this;
    });
    apiRegister('stateRestore.state().rename()', function (newIdentifier) {
        var ctx = this.context[0];
        var state = this[0];
        // Check if renaming states is allowed
        if (state.c.save) {
            var states = ctx._stateRestore.s.states;
            var ids = [];
            for (var _i = 0, states_2 = states; _i < states_2.length; _i++) {
                var intState = states_2[_i];
                ids.push(intState.s.identifier);
            }
            state.rename(newIdentifier, ids);
        }
        return this;
    });
    apiRegister('stateRestore.state().load()', function () {
        var ctx = this[0];
        ctx.load();
        return this;
    });
    apiRegister('stateRestore.state().remove()', function (skipModal) {
        var ctx = this[0];
        // Check if removal of states is allowed
        if (ctx.c.remove) {
            ctx.remove(skipModal);
        }
        return this;
    });
    apiRegister('stateRestore.states().remove()', function (skipModal) {
        var _this = this;
        var removeAllCallBack = function (skipModalIn) {
            var success = true;
            var that = _this.toArray();
            while (that.length > 0) {
                var set = that[0];
                if (set !== undefined && set.c.remove) {
                    var tempSuccess = set.remove(skipModalIn);
                    if (tempSuccess !== true) {
                        success = tempSuccess;
                    }
                    else {
                        that.splice(0, 1);
                    }
                }
                else {
                    break;
                }
            }
            return success;
        };
        if (this.context[0]._stateRestore && this.context[0]._stateRestore.c.remove) {
            if (skipModal) {
                removeAllCallBack(skipModal);
            }
            else {
                this.context[0]._stateRestore.removeAll(removeAllCallBack);
            }
        }
        return this;
    });
    apiRegister('stateRestore.activeStates()', function () {
        var ctx = this.context[0];
        this.length = 0;
        if (!ctx._stateRestore) {
            var api = DataTable.Api(ctx);
            var src = new DataTable.StateRestoreCollection(api, {});
            _stateRegen(api, src);
        }
        if (ctx._stateRestore) {
            this.push.apply(this, ctx._stateRestore.findActive());
        }
        return this;
    });
    DataTable.ext.buttons.stateRestore = {
        action: function (e, dt, node, config) {
            config._stateRestore.load();
            node.blur();
        },
        className: 'dtsr-state',
        config: {
            split: ['updateState', 'renameState', 'removeState']
        },
        text: function (dt) {
            return dt.i18n('buttons.stateRestore', 'State %d', dt.stateRestore.states()[0].length + 1);
        }
    };
    DataTable.ext.buttons.updateState = {
        action: function (e, dt, node, config) {
            $('div.dt-button-background').click();
            config.parent._stateRestore.save();
        },
        text: function (dt) {
            return dt.i18n('buttons.updateState', 'Update');
        }
    };
    DataTable.ext.buttons.savedStates = {
        buttons: [],
        extend: 'collection',
        init: function (dt, node, config) {
            dt.on('stateRestore-change', function () {
                dt.button(node).text(dt.i18n('buttons.savedStates', 'Saved States', dt.stateRestore.states().length));
            });
            if (dt.settings()[0]._stateRestore === undefined) {
                _buttonInit(dt, config);
            }
        },
        name: 'SaveStateRestore',
        text: function (dt) {
            return dt.i18n('buttons.savedStates', 'Saved States', 0);
        }
    };
    DataTable.ext.buttons.savedStatesCreate = {
        buttons: [],
        extend: 'collection',
        init: function (dt, node, config) {
            dt.on('stateRestore-change', function () {
                dt.button(node).text(dt.i18n('buttons.savedStates', 'Saved States', dt.stateRestore.states().length));
            });
            if (dt.settings()[0]._stateRestore === undefined) {
                if (config.config === undefined) {
                    config.config = {};
                }
                config.config._createInSaved = true;
                _buttonInit(dt, config);
            }
        },
        name: 'SaveStateRestore',
        text: function (dt) {
            return dt.i18n('buttons.savedStates', 'Saved States', 0);
        }
    };
    DataTable.ext.buttons.createState = {
        action: function (e, dt, node, config) {
            e.stopPropagation();
            var stateRestoreOpts = dt.settings()[0]._stateRestore.c;
            var language = dt.settings()[0].oLanguage;
            // If creation/saving is not allowed then return
            if (!stateRestoreOpts.create || !stateRestoreOpts.save) {
                return;
            }
            var prevStates = dt.stateRestore.states().toArray();
            // Create a replacement regex based on the i18n values
            var defaultString = language.buttons !== undefined && language.buttons.stateRestore !== undefined ?
                language.buttons.stateRestore :
                'State ';
            var replaceRegex;
            if (defaultString.indexOf('%d') === defaultString.length - 3) {
                replaceRegex = new RegExp(defaultString.replace(/%d/g, ''));
            }
            else {
                var splitString = defaultString.split('%d');
                replaceRegex = [];
                for (var _i = 0, splitString_1 = splitString; _i < splitString_1.length; _i++) {
                    var parts = splitString_1[_i];
                    replaceRegex.push(new RegExp(parts));
                }
            }
            var getId = function (identifier) {
                var id;
                if (Array.isArray(replaceRegex)) {
                    id = identifier;
                    for (var _i = 0, replaceRegex_1 = replaceRegex; _i < replaceRegex_1.length; _i++) {
                        var reg = replaceRegex_1[_i];
                        id = id.replace(reg, '');
                    }
                }
                else {
                    id = identifier.replace(replaceRegex, '');
                }
                // If the id after replacement is not a number, or the length is the same as before,
                //  it has been customised so return 0
                if (isNaN(+id) || id.length === identifier) {
                    return 0;
                }
                // Otherwise return the number that has been assigned previously
                else {
                    return +id;
                }
            };
            // Extract the numbers from the identifiers that use the standard naming convention
            var identifiers = prevStates
                .map(function (state) { return getId(state.s.identifier); })
                .sort(function (a, b) { return +a < +b ?
                1 :
                +a > +b ?
                    -1 :
                    0; });
            var lastNumber = identifiers[0];
            dt.stateRestore.state.add(dt.i18n('buttons.stateRestore', 'State %d', lastNumber !== undefined ? lastNumber + 1 : 1), config.config);
            var states = dt.stateRestore.states().sort(function (a, b) {
                var aId = +getId(a.s.identifier);
                var bId = +getId(b.s.identifier);
                return aId > bId ?
                    1 :
                    aId < bId ?
                        -1 :
                        0;
            });
            var button = dt.button('SaveStateRestore:name');
            var stateButtons = button[0] !== undefined && button[0].inst.c.buttons[0].buttons !== undefined ?
                button[0].inst.c.buttons[0].buttons :
                [];
            // remove any states from the previous rebuild - if they are still there they will be added later
            for (var i = 0; i < stateButtons.length; i++) {
                if (stateButtons[i].extend === 'stateRestore') {
                    stateButtons.splice(i, 1);
                    i--;
                }
            }
            if (stateRestoreOpts._createInSaved) {
                stateButtons.push('createState');
            }
            for (var _a = 0, states_3 = states; _a < states_3.length; _a++) {
                var state = states_3[_a];
                var split = stateRestoreOpts.splitSecondaries.slice();
                if (split.includes('updateState') && !stateRestoreOpts.save) {
                    split.splice(split.indexOf('updateState'), 1);
                }
                if (split.includes('renameState') &&
                    (!stateRestoreOpts.save || !stateRestoreOpts.rename)) {
                    split.splice(split.indexOf('renameState'), 1);
                }
                if (split.includes('removeState') && !stateRestoreOpts.remove) {
                    split.splice(split.indexOf('removeState'), 1);
                }
                stateButtons.push({
                    _stateRestore: state,
                    attr: {
                        title: state.s.identifier
                    },
                    config: {
                        split: split
                    },
                    extend: 'stateRestore',
                    text: StateRestore.entityEncode(state.s.identifier),
                    popoverTitle: StateRestore.entityEncode(state.s.identifier)
                });
            }
            dt.button('SaveStateRestore:name').collectionRebuild(stateButtons);
            node.blur();
            // Need to disable the removeAllStates button if there are no states and it is present
            var buttons = dt.buttons();
            for (var _b = 0, buttons_1 = buttons; _b < buttons_1.length; _b++) {
                var butt = buttons_1[_b];
                if ($(butt.node).hasClass('dtsr-removeAllStates')) {
                    if (states.length === 0) {
                        dt.button(butt.node).disable();
                    }
                    else {
                        dt.button(butt.node).enable();
                    }
                }
            }
        },
        init: function (dt, node, config) {
            if (dt.settings()[0]._stateRestore === undefined && dt.button('SaveStateRestore:name').length > 1) {
                _buttonInit(dt, config);
            }
        },
        text: function (dt) {
            return dt.i18n('buttons.createState', 'Create State');
        }
    };
    DataTable.ext.buttons.removeState = {
        action: function (e, dt, node, config) {
            config.parent._stateRestore.remove();
            node.blur();
        },
        text: function (dt) {
            return dt.i18n('buttons.removeState', 'Remove');
        }
    };
    DataTable.ext.buttons.removeAllStates = {
        action: function (e, dt, node) {
            dt.stateRestore.states().remove(true);
            node.blur();
        },
        className: 'dt-button dtsr-removeAllStates',
        init: function (dt, node) {
            if (!dt.settings()[0]._stateRestore || dt.stateRestore.states().length === 0) {
                $(node).addClass('disabled');
            }
        },
        text: function (dt) {
            return dt.i18n('buttons.removeAllStates', 'Remove All States');
        }
    };
    DataTable.ext.buttons.renameState = {
        action: function (e, dt, node, config) {
            var states = dt.settings()[0]._stateRestore.s.states;
            var ids = [];
            for (var _i = 0, states_4 = states; _i < states_4.length; _i++) {
                var state = states_4[_i];
                ids.push(state.s.identifier);
            }
            config.parent._stateRestore.rename(undefined, ids);
            node.blur();
        },
        text: function (dt) {
            return dt.i18n('buttons.renameState', 'Rename');
        }
    };
    function _init(settings, options) {
        if (options === void 0) { options = null; }
        var api = new DataTable.Api(settings);
        var opts = options
            ? options
            : api.init().stateRestore || DataTable.defaults.stateRestore;
        var stateRestore = new StateRestoreCollection(api, opts);
        _stateRegen(api, stateRestore);
        return stateRestore;
    }
    /**
     * Initialisation function if initialising using a button
     *
     * @param dt The datatables instance
     * @param config the config for the button
     */
    function _buttonInit(dt, config) {
        var SRC = new DataTable.StateRestoreCollection(dt, config.config);
        _stateRegen(dt, SRC);
    }
    function _stateRegen(dt, src) {
        var states = dt.stateRestore.states();
        var button = dt.button('SaveStateRestore:name');
        var stateButtons = [];
        var i;
        // Need to get the original configuration object, so we can rebuild it
        // It might be nested, so need to traverse down the tree
        if (button[0]) {
            var idxs = button.index().split('-');
            stateButtons = button[0].inst.c.buttons;
            for (i = 0; i < idxs.length; i++) {
                if (stateButtons[idxs[i]].buttons) {
                    stateButtons = stateButtons[idxs[i]].buttons;
                }
                else {
                    stateButtons = [];
                    break;
                }
            }
        }
        var stateRestoreOpts = dt.settings()[0]._stateRestore.c;
        // remove any states from the previous rebuild - if they are still there they will be added later
        for (i = 0; i < stateButtons.length; i++) {
            if (stateButtons[i].extend === 'stateRestore') {
                stateButtons.splice(i, 1);
                i--;
            }
        }
        if (stateRestoreOpts._createInSaved) {
            stateButtons.push('createState');
        }
        if (states === undefined || states.length === 0) {
            stateButtons.push('<span class="' + src.classes.emptyStates + '">' +
                dt.i18n('stateRestore.emptyStates', src.c.i18n.emptyStates) +
                '</span>');
        }
        else {
            for (var _i = 0, states_5 = states; _i < states_5.length; _i++) {
                var state = states_5[_i];
                var split = stateRestoreOpts.splitSecondaries.slice();
                if (split.includes('updateState') && !stateRestoreOpts.save) {
                    split.splice(split.indexOf('updateState'), 1);
                }
                if (split.includes('renameState') &&
                    (!stateRestoreOpts.save || !stateRestoreOpts.rename)) {
                    split.splice(split.indexOf('renameState'), 1);
                }
                if (split.includes('removeState') && !stateRestoreOpts.remove) {
                    split.splice(split.indexOf('removeState'), 1);
                }
                stateButtons.push({
                    _stateRestore: state,
                    attr: {
                        title: state.s.identifier
                    },
                    config: {
                        split: split
                    },
                    extend: 'stateRestore',
                    text: StateRestore.entityEncode(state.s.identifier),
                    popoverTitle: StateRestore.entityEncode(state.s.identifier)
                });
            }
        }
        dt.button('SaveStateRestore:name').collectionRebuild(stateButtons);
        // Need to disable the removeAllStates button if there are no states and it is present
        var buttons = dt.buttons();
        for (var _a = 0, buttons_2 = buttons; _a < buttons_2.length; _a++) {
            var butt = buttons_2[_a];
            if ($(butt.node).hasClass('dtsr-removeAllStates')) {
                if (states.length === 0) {
                    dt.button(butt.node).disable();
                }
                else {
                    dt.button(butt.node).enable();
                }
            }
        }
    }
    // Attach a listener to the document which listens for DataTables initialisation
    // events so we can automatically initialise
    $(document).on('preInit.dt.dtsr', function (e, settings) {
        if (e.namespace !== 'dt') {
            return;
        }
        if (settings.oInit.stateRestore ||
            DataTable.defaults.stateRestore) {
            if (!settings._stateRestore) {
                _init(settings, null);
            }
        }
    });

})();


return DataTable;
}));


/*! Bootstrap integration for DataTables' StateRestore
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-staterestore'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.StateRestore ) {
				require('datatables.net-staterestore')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


$.extend(true, DataTable.StateRestoreCollection.classes, {
    checkBox: 'dtsr-check-box form-check-input',
    checkLabel: 'dtsr-check-label form-check-label',
    checkRow: 'dtsr-check-row form-check',
    creationButton: 'dtsr-creation-button btn btn-secondary',
    creationForm: 'dtsr-creation-form modal-body',
    creationText: 'dtsr-creation-text modal-header',
    creationTitle: 'dtsr-creation-title modal-title',
    nameInput: 'dtsr-name-input form-control',
    nameLabel: 'dtsr-name-label form-label'
});
$.extend(true, DataTable.StateRestore.classes, {
    confirmationButton: 'dtsr-confirmation-button btn btn-secondary',
    input: 'dtsr-input form-control'
});


return DataTable;
}));


