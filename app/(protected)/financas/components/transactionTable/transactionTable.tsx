"use client";

import { TransactionTableDesktop } from "./transactionTableDesktop";
import { TransactionTableMobile } from "./transactionTableMobile";

export function TransactionTable({
    data,
    onEdit,
    onDelete,
    pageChanging,
    accountName,
}: any) {
    return (
        <>
            <TransactionTableDesktop
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                accountName={accountName}
            />

            <TransactionTableMobile
                data={data}
                onEdit={onEdit}
                onDelete={onDelete}
                pageChanging={pageChanging}
                accountName={accountName}
            />
        </>
    );
}
