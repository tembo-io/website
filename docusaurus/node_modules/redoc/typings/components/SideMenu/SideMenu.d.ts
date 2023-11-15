import * as React from 'react';
import { MenuStore } from '../../services';
import type { IMenuItem } from '../../services';
export declare class SideMenu extends React.Component<{
    menu: MenuStore;
    className?: string;
}> {
    static contextType: React.Context<import("../../services").RedocNormalizedOptions>;
    private _updateScroll?;
    render(): JSX.Element;
    activate: (item: IMenuItem) => void;
    private saveScrollUpdate;
}
