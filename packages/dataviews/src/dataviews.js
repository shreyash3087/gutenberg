/**
 * WordPress dependencies
 */
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Pagination from './pagination';
import ViewActions from './view-actions';
import Filters from './filters';
import Search from './search';
import { VIEW_LAYOUTS, LAYOUT_TABLE, LAYOUT_GRID } from './constants';
import BulkActions from './bulk-actions';

const defaultGetItemId = ( item ) => item.id;
const defaultOnSelectionChange = () => {};

export default function DataViews( {
	view,
	onChangeView,
	fields,
	search = true,
	searchLabel = undefined,
	actions,
	data,
	getItemId = defaultGetItemId,
	isLoading = false,
	paginationInfo,
	supportedLayouts,
	onSelectionChange = defaultOnSelectionChange,
	onDetailsChange = null,
	deferredRendering = false,
} ) {
	const [ selection, setSelection ] = useState( [] );

	useEffect( () => {
		if (
			selection.length > 0 &&
			selection.some(
				( id ) => ! data.some( ( item ) => item.id === id )
			)
		) {
			const newSelection = selection.filter( ( id ) =>
				data.some( ( item ) => item.id === id )
			);
			setSelection( newSelection );
			onSelectionChange(
				data.filter( ( item ) => newSelection.includes( item.id ) )
			);
		}
	}, [ selection, data, onSelectionChange ] );

	const onSetSelection = useCallback(
		( items ) => {
			setSelection( items.map( ( item ) => item.id ) );
			onSelectionChange( items );
		},
		[ setSelection, onSelectionChange ]
	);

	const ViewComponent = VIEW_LAYOUTS.find(
		( v ) => v.type === view.type
	).component;
	const _fields = useMemo( () => {
		return fields.map( ( field ) => ( {
			...field,
			render: field.render || field.getValue,
		} ) );
	}, [ fields ] );
	return (
		<div className="dataviews-wrapper">
			<VStack spacing={ 3 } justify="flex-start">
				<HStack
					alignment="flex-start"
					justify="start"
					className="dataviews-filters__view-actions"
				>
					{ search && (
						<Search
							label={ searchLabel }
							view={ view }
							onChangeView={ onChangeView }
						/>
					) }
					{ [ LAYOUT_TABLE, LAYOUT_GRID ].includes( view.type ) && (
						<BulkActions
							actions={ actions }
							data={ data }
							onSelectionChange={ onSetSelection }
							selection={ selection }
							getItemId={ getItemId }
						/>
					) }
					<ViewActions
						fields={ _fields }
						view={ view }
						onChangeView={ onChangeView }
						supportedLayouts={ supportedLayouts }
					/>
				</HStack>
				<HStack
					justify="start"
					className="dataviews-filters__container"
					wrap
				>
					<Filters
						fields={ _fields }
						view={ view }
						onChangeView={ onChangeView }
					/>
				</HStack>
				<ViewComponent
					fields={ _fields }
					view={ view }
					onChangeView={ onChangeView }
					actions={ actions }
					data={ data }
					getItemId={ getItemId }
					isLoading={ isLoading }
					onSelectionChange={ onSetSelection }
					onDetailsChange={ onDetailsChange }
					selection={ selection }
					deferredRendering={ deferredRendering }
				/>
				<Pagination
					view={ view }
					onChangeView={ onChangeView }
					paginationInfo={ paginationInfo }
				/>
			</VStack>
		</div>
	);
}
