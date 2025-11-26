"use client";

import toast from "react-hot-toast";

export function notifySuccess(message: string) {
    toast.success(message, {
        duration: 3500,
    });
}

export function notifyError(message: string) {
    toast.error(message, {
        duration: 4500,
    });
}

export function notifyWarning(message: string) {
    toast(message, {
        duration: 4500,
        style: {
            background: "#f59e0b",
            color: "#fff",
            fontWeight: 500,
        },
    });
}

export function notifyLoading(message: string) {
    return toast.loading(message, {
        style: {
            background: "#0f766e",
            color: "#fff",
            fontWeight: 500,
        },
    });
}

export function dismissToast(id?: string) {
    toast.dismiss(id);
}
