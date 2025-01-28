import Debug from "debug";
import Menu from "@/components/Menu";
import {useTranslations} from "use-intl";
import {Switch, useMantineColorScheme} from "@mantine/core";
const debug = Debug("gahmuret:app:routes:account._index");

export default function AccountPage() {
    const t = useTranslations();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === "dark";
    return (
        <div data-testid="AccountPage" className="AccountPage">
            <Switch
                color={dark ? "yellow" : "blue"}
                label="Dark theme"
                onClick={() => toggleColorScheme()}
            />
        </div>
    );
}
