import {
    List,
    Text,
} from "@mantine/core";
import {Link} from "@remix-run/react";
import Debug from "debug";
import {useTranslations} from "use-intl";
const debug = Debug("gahmuret:app:components:Menu");

export default function Menu(props: {
    loggedIn: boolean;
}) {
    const t = useTranslations();

    return (
        <div data-testid="Menu" className="Menu">
            <List>
                <List.Item>
                    <Text>
                        <Link to="/">{t('Menu.home')}</Link>
                    </Text>
                </List.Item>
                {props.loggedIn && <List.Item>
                    <Text>
                        <Link to="/account">{t('Menu.account')}</Link>
                    </Text>
                </List.Item>}
                {!props.loggedIn && <List.Item>
                    <Text>
                        <Link to="/account">{t('Menu.login')}</Link>
                    </Text>
                </List.Item>}
                {props.loggedIn && <List.Item>
                    <Text>
                        <Link to="/logout">{t('Menu.logout')}</Link>
                    </Text>
                </List.Item>}
            </List>
        </div>
    );
}
