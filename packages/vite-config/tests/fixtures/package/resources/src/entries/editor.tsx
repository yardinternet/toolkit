import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { core } from '../shared/core';

export const App = () => <Button>{ __( core( 'hi' ) ) }</Button>;
