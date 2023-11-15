import { useMemo } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { usePluginData, useAllPluginInstancesData, } from '@docusaurus/useGlobalData';
import { useColorMode } from '@docusaurus/theme-common';
import merge from 'lodash/merge';
import '../global';
/**
 * Redocusaurus
 * https://redocusaurus.vercel.app/
 * (c) 2023 Rohit Gohri
 * Released under the MIT License
 */
export function useSpecOptions(themeId = 'theme-redoc', optionsOverrides) {
    const isBrowser = useIsBrowser();
    const isDarkTheme = useColorMode().colorMode === 'dark';
    const defaultThemeOptions = useAllPluginInstancesData('docusaurus-theme-redoc', {
        failfast: true,
    });
    const themeOptions = usePluginData('docusaurus-theme-redoc', themeId) ||
        Object.values(defaultThemeOptions)[0];
    const result = useMemo(() => {
        const { lightTheme, darkTheme, options: redocOptions } = themeOptions;
        const commonOptions = {
            // Disable offset when server rendering and set to selector
            scrollYOffset: !isBrowser && typeof redocOptions.scrollYOffset === 'string'
                ? 0
                : redocOptions.scrollYOffset,
        };
        const lightThemeOptions = merge({
            ...redocOptions,
            ...commonOptions,
            theme: lightTheme,
        }, optionsOverrides);
        const darkThemeOptions = merge({
            ...redocOptions,
            ...commonOptions,
            theme: darkTheme,
        }, optionsOverrides);
        const options = isBrowser && isDarkTheme ? darkThemeOptions : lightThemeOptions;
        return {
            options,
            darkThemeOptions,
            lightThemeOptions,
        };
    }, [isBrowser, isDarkTheme, themeOptions, optionsOverrides]);
    return result;
}
