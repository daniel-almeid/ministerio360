// O banco entrega no máximo 1.000 linhas por consulta. Para listas que podem passar disso
// (ex.: igreja com muitos membros), busca página por página até acabar.
export const SUPABASE_PAGE_SIZE = 1000;

type PageResult<T> = { data: T[] | null; error: unknown };

export async function fetchAllPages<T>(
    fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
    pageSize = SUPABASE_PAGE_SIZE
): Promise<T[]> {
    const result: T[] = [];

    for (let from = 0; ; from += pageSize) {
        const { data, error } = await fetchPage(from, from + pageSize - 1);
        if (error) throw error;

        const rows = data ?? [];
        result.push(...rows);
        if (rows.length < pageSize) break;
    }

    return result;
}
