"use client";

import { TransactionTableDesktop } from "./transactionTableDesktop";
import { TransactionTableMobile } from "./transactionTableMobile";

export function TransactionTable({
    data,
    onEdit,
    onDelete,
    pageChanging,
}: any) {
    return (
        <>
            <TransactionTableDesktop
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            <TransactionTableMobile
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                pageChanging={pageChanging}
            />
        </>
    );
}
