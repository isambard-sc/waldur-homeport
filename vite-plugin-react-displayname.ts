import type { Plugin } from 'vite';
import * as babel from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

// Babel plugin to add display names
const babelDisplayNamePlugin = declare((api) => {
  api.assertVersion(7);

  const addDisplayName = (path, componentName) => {
    path.insertAfter(
      api.types.expressionStatement(
        api.types.assignmentExpression(
          '=',
          api.types.memberExpression(
            api.types.identifier(componentName),
            api.types.identifier('displayName'),
          ),
          api.types.stringLiteral(componentName),
        ),
      ),
    );
  };

  return {
    name: 'transform-react-display-name',
    visitor: {
      FunctionDeclaration(path) {
        const componentName = path.node.id?.name;
        if (componentName && /^[A-Z]/.test(componentName)) {
          addDisplayName(path, componentName);
        }
      },
      VariableDeclarator(path) {
        const componentName =
          path.node.id.type === 'Identifier' && path.node.id.name;
        if (
          componentName &&
          /^[A-Z]/.test(componentName) &&
          path.node.init &&
          (path.node.init.type === 'ArrowFunctionExpression' ||
            path.node.init.type === 'FunctionExpression')
        ) {
          addDisplayName(path.parentPath, componentName);
        }
      },
      ClassDeclaration(path) {
        const componentName = path.node.id?.name;
        if (
          componentName &&
          /^[A-Z]/.test(componentName) &&
          path.node.superClass
        ) {
          const displayNameProperty = api.types.classProperty(
            api.types.identifier('displayName'),
            api.types.stringLiteral(componentName),
            null,
            null,
            false,
            true,
          );
          path.get('body').unshiftContainer('body', displayNameProperty);
        }
      },
    },
  };
});

export default function reactDisplayNamePlugin(): Plugin {
  return {
    name: 'vite-plugin-react-displayname',
    async transform(code: string, id: string) {
      // Check if file should be processed
      if (!id.endsWith('.tsx') || id.includes('node_modules')) {
        return null;
      }

      try {
        const result = await babel.transformAsync(code, {
          filename: id,
          plugins: [
            ['@babel/plugin-syntax-typescript', { isTSX: true }],
            '@babel/plugin-syntax-jsx',
            babelDisplayNamePlugin,
          ],
          ast: true,
          sourceMaps: true,
          configFile: false,
          babelrc: false,
        });

        return {
          code: result?.code || code,
          map: result?.map,
        };
      } catch (error) {
        console.error('Error transforming component:', error);
        return null;
      }
    },
  };
}
