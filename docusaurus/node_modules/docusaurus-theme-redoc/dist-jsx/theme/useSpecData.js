import { useAllPluginInstancesData } from '@docusaurus/useGlobalData';
/**
 *
 * @param id ID of plugin data
 * @returns Spec Data of ID or first one if ID is not provided
 */
export function useSpecData(id) {
    const allData = useAllPluginInstancesData('docusaurus-plugin-redoc');
    const apiData = id
        ? allData?.[id]
        : Object.values(allData ?? {})?.[0];
    return apiData;
}
export default useSpecData;
