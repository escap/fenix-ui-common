<h1>Pivotator and Fenix Tool : General description</h1>


Pivotator is a client-side component designed to perform some operations on a normalized dataset.
The two main operation are :
<br>-The denormalization of the dataset
<br>-Aggregation of the values according to a set of functions (cf function.js section)

The fenixTool is a client-side component designed to provide a set of function to provide a configuration to the Pivotator from a Fenix ressource and the UI using the output of the fenix-ui-filter component.
(A version using sdmx2.1 is under devellop.)

#Pivotator (start.js)

The pivotator is an javascript Object exposing several functions to denormalize a normalized dataset and apply aggregation functions on it.
The default function is called pivot, and produce a new structure which can be used to create visualization component (table, chart and in the future layered maps).
Other function can be apply like toFX or toPivotData to produce the same result in different formats (toFX produce a ressource fenix like structure with a multivalue organisation, and toPivotData expose the internal structure of the dataset inside the pivotator class). These three fonction share the same signature that the standart pivot function.
We will describe here only the standart function that is currently used in the fenix projects.


<h2>Pivitator.pivot() function</h2>
<table>
<tr>
<th>pivot()</th><th colspan=2>model=this.pivotator.pivot(FXRessource, myPivotatorConfig);</th></tr>
<tr><td>Input</td><td colspan=2>FXRessource is a Fenix ressource in Json Format containing the metadata and the data of a Fenix dataset,
<br>myPivotatorConfig is a json Object describe in the next table</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>
model is the Json structure used to create visualization component.
It will be describe in the FXMod description table

</td>
</tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
        var model = this.pivotator.pivot(this.model, myPivotatorConfig);

</code>
</td>
</tr>
</table>

<h2>Standard Pivotator configuration</h2>
<table>
<tr><th colspan=2>myPivotatorConfig</th></tr>
<tr><th>attribute</th><th>Description</th><th>Exemple</th></tr>
<tr><td>aggregationFn</td><td>For each columns describe in the fenix ressource, it set which aggregation function need to by apply, these function are implemented in the function.js file, and the string value refer to thei key identification</td><td>{value:"sum",um:"diff"}</td></tr>
<tr><td>aggregations</td><td>describe which dimensions will be aggregate in the returned dataset, it's similar to a group by function in a sql query</td><td>[]</td></tr>
<tr><td>columns</td><td>indicate the dimensions that will be put in columns in the denormalization of the dataset</td><td>["Year"]</td></tr>
<tr><td>decimals</td><td>indicate the number of decimals in the returned aggregated value</td><td>[2]</td></tr>
<tr><td>el</td><td>Dom identification of the container of the visualization result</td><td>"#olap-interaction"</td></tr>
<tr><td>formatter</td><td>choose the formater of the aggregated value returned by the pivotator, standard choices are localstring or number but they can be exended in the function.js file</td><td>"localstring"</td></tr>
<tr><td>groupedRow</td><td>special parameter for the table creator, it allow to choose if we want to display all the header rows, or if we want to display a new row label only if the previous row label is different (see exemples)</td><td>false</td></tr>
<tr><td>hidden</td><td>Not yet completly implemented, it should say if a columns will appear in the visualization tool</td><td>["domainCode"]</td></tr>
<tr><td>inputFormat</td>the two choice are raw or fenixtool, in case where fenixtool is used, the parseInput function of the fenix tool will try to link the columns of code and label for each dimension<td></td><td>"fenixtool"</td></tr>
<tr><td>model</td><td>standard Fenix ressource that we want to perform with the pivotator</td><td>cf Fenix ressource</td></tr>
<tr><td>rows</td><td>indicate the dimensions that will be put in rows in the denormalization of the dataset</td><td>["IndicatorCode","CountryCode"]</td></tr>
<tr><td>showRowHeaders</td><td>tell the pivotator to return for each rows the corresponding columns value of the row in the original Fenix ressource, this parameter should become obsolete in the future version of the pivotator</td><td>true</td></tr>
<tr><td>values</td><td>indicate the columns in the original fenix ressource we want to aggregate and denormalize</td><td>["value"]</td></tr>

</table>


<h2>FXMod description</h2>
A FXmod object is a structure that try to describe the dataset we want to visualize.
Basicly, a visualisation dataset is an array of matrices of data, for instance, values, flag and unit. Other matrix of data can be added in the attribute matrix.
In these two dimentional matrices, the first dimension is called row and the second is called columns. In the chart point of view, the rows will correpond to a serie, and a columns to a X-axis value.
The value concept in a FXmod, is then corresponding to a Y-axis value in a chart.
<table>
<tr><th colspan=2>FXMod</th></tr>
<tr><th>attribute</th><th>Description</th><th>Example</th></tr>

<tr><td>attribute</td><td>under devellopment</td><td></td></tr>
<tr><td>nookline</td><td>under devellopment</td><td></td></tr>
<tr><td>okline</td><td>under devellopment</td><td></td></tr>

<tr><td>cols</td><td>under devellopment</td><td></td></tr>
<tr><td>cols2label</td><td>under devellopment</td><td></td></tr>

<tr><td>cols2</td><td>matrix of the different columns values, each layer of the matrix refer to a dimension define in the columns part of
 the pivotator config</td><td>[[2000,"Export"],[2000,"Import"],[2001,"Export"],[2001,"Import"]]</td></tr>
<tr><td>colsname</td><td>Name of the columns ID in the Fenix ressource</td><td>["Year","Indicator"]</td></tr>
<tr><td>rowname</td><td>Name of the rows ID in the Fenix ressource</td><td>["Countrycode","ItemCode"]</td></tr>

<tr><td>data</td><td>This matrix is the result of the differents operations  of denormalization and aggregation performed on the original Fenix ressource, each element in the first level array correpond to a "rows" entry, and each element in the second level array correspond to a columns entry</td><td>[[1,5],[5,null]]</td></tr>
<tr><td>flag</td><td rowspan=2 colspan=2>By default, these two matrix are filled by the columns of the fenix ressource subject um and flag, the mecanism is the same as the subject="value" columns in the original fenix ressource, but with differents function of aggregation </td>></tr>
<tr><td>unit</td></tr>

<tr><td>rows</td><td>matrix of the different rows values, each layer of the matrix refer to a dimension define in the rows part of
 the pivotator config</td><td>[["Italy","Wheat"],["Italy","Maize"],["France","Wheat"],["France","Maize"],]</td></tr>

</table>


#FenixTool (fenixtool.js)
<h2>Main functions</h2>
<table>
<tr>
<th>toFilter</th><th colspan=2>itemsFromFenixTool=fenixtool.toFilter(Model)</th></tr>
<tr><td>Description</td><td colspan=2>This function is used to add in the fenix-ui-filter component to add in the toolbar some ui-components linked to the pivotators operations (denormalization with a drag and drop elements and the list box of the available aggregation functions</td></tr>
<tr><td>Input</td><td colspan=2>Model is a Fenix ressource in Json Format containing the metadata and the data of a Fenix dataset</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>itemsFromFenixTool is a json object extended by the fenix-ui-filter component to create in its toolbar the sortable component to move the dimension in the Rows/columns or X-Absis-Y-axis of the creators, and to create the dropdown list of the available aggregations functions.</td>
</tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
 var itemsFromFenixTool = this.fenixTool.toFilter(Model);
  
var  items = $.extend(true, {}, FilterModel, itemsFromFenixTool);
 
 this.filter = new Filter({
            el: "#container",
            items: items
        });
</code>
</td>
</tr>





<tr>
<th>toTableConfig</th><th colspan=2> var config = this.fenixTool.toTableConfig(values);</th></tr>
<tr><td>Description</td><td colspan=2>This function is used to configure the pivotator for the table-creator visualization component</td></tr>

<tr><td>Input</td><td colspan=2>values	 is the result of the function getValues() of the fenix-ui-filter component adapted for the differents creators using the pivotator</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>config is an initial pivotator configuration object that will be extended by the parseInput function in case where the pivotator configuration option inputFormat is set to "fenixtool" </tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
 var values = this.filter.getValues();
var config = this.fenixTool.toTableConfig(values);
</code>
</td>
</tr>



<tr>
<th>toChartConfig</th><th colspan=2> var config = this.fenixTool.toChartConfig(values);</th></tr>
<tr><td>Description</td><td colspan=2>This function is used to configure the pivotator for the graphs-creator visualization component</td></tr>

<tr><td>Input</td><td colspan=2>values	 is the result of the function getValues() of the fenix-ui-filter component adapted for the differents creators using the pivotator</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>config is an initial pivotator configuration object that will be extended by the parseInput function in case where the pivotator configuration option inputFormat is set to "fenixtool" </tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
 var values = this.filter.getValues();
var config = this.fenixTool.toChartConfig(values);
</code>
</td>
</tr>

<tr>
<th>parseInput</th><th colspan=2> myPivotatorConfig=this.fenixTool.parseInput(FenixMetadataDSD, pivotatorConfig)</th></tr>
<tr><td>Input</td><td colspan=2>FenixMetadataDSD is the  DSD part of a Fenix ressource metadata, pivotatorConfig is an initial pivotator configuration file that will be extend by the function to provide the final configuration</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>When the pivotatorConfig.inputFormat is set to "fenixtool", the function will link <br>-the label columns with the code columns
<br>-the values columns with their attributes like flags or units columns </tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
 var myPivotatorConfig = $.extend(true, {}, this.initial, this.fenixTool.parseInput(this.model.metadata.dsd, this.pivotatorConfig));
var model = this.pivotator.pivot(this.model, myPivotatorConfig);
</code>
</td>
</tr>

<tr>
<th>sdmxToFenix (beta version)</th><th colspan=2> Model=this.fenixTool.sdmxToFenix(ModelSDMX,SDMXDSD)</th></tr>
<tr><td>Input</td><td colspan=2>ModelSDMX is sdmx 2.1 DSD File and SDMXDSD is a sdmx 2.1 dataset file</td>
</tr>
<tr>
<td>Output</td>
<td colspan=2>Model is a Fenix ressource json file with the minimum attributs needed to be visualized by the table-creator or the chart creator components </tr>
<tr>
<td>Exemple : </td>
<td colspan=2>
<code>  
		Model=this.fenixTool.sdmxToFenix(ModelSDMX,SDMXDSD)
</code>
</td>
</tr>

		



</table>
#function.js


#Workflow and integration in Fenix projects


