'use client';

import * as React from 'react';

interface UseControllableStateProps<T> {
	prop: T | undefined;
	defaultProp?: T;
	onChange?: (state: T) => void;
}

function useControllableState<T>({
	prop,
	defaultProp,
	onChange,
}: UseControllableStateProps<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [uncontrolledProp, setUncontrolledProp] = React.useState<T>(
		defaultProp as T
	);
	const isControlled = prop !== undefined;
	const value = isControlled ? prop : uncontrolledProp;

	const handleChange = React.useCallback(
		(nextValue: React.SetStateAction<T>) => {
			const setter = nextValue as (prevState: T) => T;
			const newValue =
        typeof nextValue === 'function' ? setter(value) : nextValue;

			if (!isControlled) {
				setUncontrolledProp(newValue);
			}

			onChange?.(newValue);
		},
		[isControlled, onChange, value]
	);

	return [value, handleChange];
}

export { useControllableState };
