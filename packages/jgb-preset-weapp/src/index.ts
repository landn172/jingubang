import BabelPlugin from 'jgb-plugin-babel';
import CssPlugin from 'jgb-plugin-css';
import HtmlPlugin from 'jgb-plugin-html';
import JsonPlugin from 'jgb-plugin-json';
import { declare, IInitOptions } from 'jgb-shared/lib';
import { ICompiler } from 'jgb-shared/lib/pluginDeclare';

interface IPluginConfig {
  coreOptions?: IInitOptions;
}

interface IAppTabBar {
  color: string;
  selectedColor: string;
  backgroundColor: string;
  borderStyle: string;
  list: IAppJsonTabarListConfg[];
  position: string;
}

interface IAppJson {
  pages: string[];
  tabBar: IAppTabBar;
}

interface IAppJsonTabarListConfg {
  pagePath: string;
  text: string;
  iconPath: string;
  selectedIconPath: string;
}

export default declare((compiler, pluginConfig: IPluginConfig = {}) => {
  if (pluginConfig && pluginConfig.coreOptions) {
    const entryFiles = []
      .concat(pluginConfig.coreOptions.entryFiles)
      .filter(Boolean);
    if (entryFiles.length === 0) {
      entryFiles.push('app.js', 'app.json', 'app.wxss');

      pluginConfig.coreOptions.entryFiles = entryFiles;
    }
  }

  attachCompilerEvent(compiler);

  BabelPlugin(compiler, {});
  JsonPlugin(compiler, {});
  HtmlPlugin(compiler, {
    extensions: ['.wxml'],
    outExt: '.wxml'
  });

  CssPlugin(compiler, {
    extensions: ['.wxss'],
    outExt: '.wxss'
  });
});

function attachCompilerEvent(compiler: ICompiler) {
  compiler.on(
    'collect-app-json',
    ({
      dependences,
      appJson
    }: {
      dependences: Set<string>;
      appJson: IAppJson;
    }) => {
      if (!appJson.tabBar) {
        return;
      }
      if (!appJson.tabBar.list) {
        return;
      }

      appJson.tabBar.list.forEach(config => {
        // tslint:disable-next-line:no-unused-expression
        config.iconPath && dependences.add(config.iconPath);
        // tslint:disable-next-line:no-unused-expression
        config.selectedIconPath && dependences.add(config.selectedIconPath);
      });
    }
  );
}
