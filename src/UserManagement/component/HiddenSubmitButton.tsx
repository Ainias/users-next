import * as React from 'react';
import { withMemo } from '@ainias42/react-bootstrap-mobile';

const hiddenSubmitButtonStyle: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
};

export const HiddenSubmitButton = withMemo(function HiddenSubmitButtonComponent() {
    return <button type="submit" aria-hidden={true} tabIndex={-1} style={hiddenSubmitButtonStyle} />;
});
