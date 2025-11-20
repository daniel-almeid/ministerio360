"use client";

import { EventTableDesktop } from "./eventTableDesktop";
import { EventTableMobile } from "./eventTableMobile";

export default function EventTable(props: any) {
    return (
        <>
            <EventTableDesktop {...props} />
            <EventTableMobile {...props} />
        </>
    );
}
