/*
 * Copyright © 2016-2017 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'brace/ext/language_tools';
import 'brace/mode/json';
import 'brace/theme/github';

import './extension-form.scss';

/* eslint-disable angular/log */

import extensionFormHttpTemplate from './extension-form-http.tpl.html';

/* eslint-enable import/no-unresolved, import/default */

/*@ngInject*/
export default function ExtensionFormHttpDirective($compile, $templateCache, $translate, types) {

    var linker = function(scope, element) {

        var template = $templateCache.get(extensionFormHttpTemplate);
        element.html(template);

        scope.types = types;
        scope.theForm = scope.$parent.theForm;

        scope.extensionCustomTransformerOptions = {
            useWrapMode: false,
            mode: 'json',
            showGutter: true,
            showPrintMargin: true,
            theme: 'github',
            advanced: {
                enableSnippets: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            },
            onLoad: aceOnLoad
        };

        if(scope.isAdd) {
            scope.converterConfigs = [];
            scope.config.converterConfigurations = scope.converterConfigs;
        } else {
            scope.converterConfigs = scope.config.converterConfigurations;
        }

        scope.updateValidity = function() {
            var valid = scope.converterConfigs && scope.converterConfigs.length > 0;
            scope.theForm.$setValidity('converterConfigs', valid);
            if(scope.converterConfigs.length) {
                for(let i=0;i<scope.converterConfigs.length;i++) {
                    if(!scope.converterConfigs[i].converters.length) {
                        scope.theForm.$setValidity('converters', false);
                        break;
                    } else {
                        scope.theForm.$setValidity('converters', true);
                    }
                }
            }
        };

        scope.$watch('converterConfigs', function() {
            scope.updateValidity();
        }, true);

        scope.addConverterConfig = function() {
            var newConverterConfig = {converterId:"", converters:[]};
            scope.converterConfigs.push(newConverterConfig);
        }

        scope.removeConverterConfig = function(config) {
            var index = scope.converterConfigs.indexOf(config);
            if (index > -1) {
                scope.converterConfigs.splice(index, 1);
            }
        }

        scope.addConverter = function(converters) {
            var newConverter = {deviceNameJsonExpression:"", deviceTypeJsonExpression:"", attributes:[], timeseries:[]};
            converters.push(newConverter);
        }

        scope.removeConverter = function(converter, converters) {
            var index = converters.indexOf(converter);
            if (index > -1) {
                converters.splice(index, 1);
            }
        }

        scope.addAttribute = function(attributes) {
            var newAttribute = {type:"", key:"", value:""};
            attributes.push(newAttribute);
        }

        scope.removeAttribute = function(attribute, attributes) {
            var index = attributes.indexOf(attribute);
            if (index > -1) {
                attributes.splice(index, 1);
            }
        }

        scope.transformerTypeChange = function(attribute) {
            attribute.transformer = "";
        }

        function aceOnLoad(_ace) {
            _ace.$blockScrolling = 1;
            _ace.on("change", function(){
                var aceValue = _ace.getSession().getDocument().getValue();
                var valid = true;
                if(!aceValue && !aceValue.length) {
                    valid = false;
                } else {
                    try {
                        angular.fromJson(aceValue);
                    } catch(e) {
                        valid = false;
                    }
                }
                scope.theForm.$setValidity('transformerRequired', valid);
            });
        }

        $compile(element.contents())(scope);
    }

    return {
        restrict: "A",
        link: linker,
        scope: {
            config: "=",
            isAdd: "="
        }
    }
}