import '../public-path'; // Leave this here (at the top)! OK boss!
import React from 'react'; // eslint-disable-line import/first
import { Loading } from '@deriv/components';
import { DBot, ServerTime, ApiHelpers } from '@deriv/bot-skeleton'; // eslint-disable-line import/first
import {
    Audio,
    BlocklyLoading,
    BotFooterExtensions,
    BotNotificationMessages,
    MainContent,
    QuickStrategy,
    RunPanel,
    RoutePromptDialog,
    Toolbar,
    NetworkToastPopup,
} from 'Components';
import { MobxContentProvider } from 'Stores/connect';
import RootStore from 'Stores';
import GTM from 'Utils/gtm';
import './app.scss';

const App = ({ passthrough }) => {
    const { root_store, WS } = passthrough;
    const [is_loading, setIsLoading] = React.useState(true);
    const root_store_instance = React.useRef(new RootStore(root_store, WS, DBot));
    const { app, common, core } = root_store_instance.current;
    const { onMount, onUnmount, showDigitalOptionsMaltainvestError } = app;

    React.useEffect(() => {
        showDigitalOptionsMaltainvestError(core.client, common);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [core.client.is_options_blocked, core.client.account_settings.country_code]);

    React.useEffect(() => {
        GTM.init(root_store_instance.current);
        ServerTime.init(common);
        app.setDBotEngineStores(root_store_instance.current);
        ApiHelpers.setInstance(app.api_helpers_store);
        const { active_symbols } = ApiHelpers.instance;
        setIsLoading(true);
        active_symbols.retrieveActiveSymbols(true).then(() => {
            setIsLoading(false);
            onMount();
        });
        return () => {
            onUnmount();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onMount, onUnmount]);

    React.useEffect(() => {
        const onDisconnectFromNetwork = () => {
            setIsLoading(false);
        };

        window.addEventListener('offline', onDisconnectFromNetwork);
        return () => {
            window.removeEventListener('offline', onDisconnectFromNetwork);
        };
    }, []);

    return is_loading ? (
        <Loading />
    ) : (
        <MobxContentProvider store={root_store_instance.current}>
            <div className='bot'>
                <BotNotificationMessages />
                <NetworkToastPopup />
                <Toolbar />
                <MainContent />
                <RunPanel />
                <QuickStrategy />
                <BotFooterExtensions />
                <Audio />
                <RoutePromptDialog />
                <BlocklyLoading />
            </div>
        </MobxContentProvider>
    );
};

export default App;
