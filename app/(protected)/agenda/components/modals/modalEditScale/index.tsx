"use client";

import ModalNewScale from "../modalNewScale";

type Props = {
    onClose: () => void;
    onSuccess: () => void;
    ministries: any[];
    scaleData: any;
};

export default function ModalEditScale({
    onClose,
    onSuccess,
    ministries,
    scaleData
}: Props) {
    return (
        <ModalNewScale
            onClose={onClose}
            onSuccess={onSuccess}
            ministries={ministries}
            scaleData={scaleData}
        />
    );
}
