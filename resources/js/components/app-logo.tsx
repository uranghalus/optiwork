import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="from-primary shadow-primary/20 flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br to-violet-600 text-white shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="text-foreground truncate leading-none font-bold">OptiWork</span>
                <span className="text-muted-foreground truncate text-xs">v1.0.0</span>
            </div>
        </>
    );
}
