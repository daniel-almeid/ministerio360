'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export function useMinistries() {
    const [ministries, setMinistries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // ✅ novo estado de busca
    const itemsPerPage = 10;
    const [totalItems, setTotalItems] = useState(0);

    async function loadMinistries() {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage - 1;

        let query = supabase
            .from('ministries')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true })
            .range(start, end);
            
        if (searchTerm.trim() !== '') {
            query = query.ilike('name', `%${searchTerm.trim()}%`);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Erro ao carregar ministérios:', error.message);
        } else {
            setMinistries(data || []);
            setTotalItems(count || 0);
        }

        setLoading(false);
    }

    function handleNext() {
        if (currentPage * itemsPerPage < totalItems) setCurrentPage((p) => p + 1);
    }

    function handlePrev() {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
        ministries,
        loading,
        loadMinistries,
        currentPage,
        totalPages,
        totalItems,
        handleNext,
        handlePrev,
        searchTerm,
        setSearchTerm,
    };
}
