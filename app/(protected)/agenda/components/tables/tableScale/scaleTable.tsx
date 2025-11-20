"use client";

import { ScaleTableDesktop } from "./scaleTableDesktop";
import { ScaleTableMobile } from "./scaleTableMobile";

export default function ScaleTable(props: any) {
    return (
        <>
            <ScaleTableDesktop {...props} />
            <ScaleTableMobile {...props} />
        </>
    );
}
