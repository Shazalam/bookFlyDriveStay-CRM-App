 export function maskEmail(email: string): string {
        if (!email) return "";
        const [name, domain] = email.split("@");
        if (!domain) return email;

        const maskedName =
            name.length <= 2
                ? name[0] + "*"
                : name.slice(0, 2) + "*".repeat(Math.max(0, name.length - 4)) + name.slice(-2);

        // const maskedDomain =
        //     domain.length <= 5
        //         ? domain[0] + "*".repeat(Math.max(0, domain.length - 2)) + domain.slice(-1)
        //         : domain.slice(0, 2) + "*".repeat(Math.max(0, domain.length - 5)) + domain.slice(-3);

        return `${maskedName}@${domain}`.toUpperCase();
    }

    export function maskPhone(phone: string): string {
        if (!phone) return "";
        if (phone.length <= 4) return "*".repeat(phone.length);
        return "******" + phone.slice(-4);
    }