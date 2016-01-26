<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" 
 xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
 xmlns="http://www.opengis.net/sld" 
 xmlns:ogc="http://www.opengis.net/ogc" 
 xmlns:xlink="http://www.w3.org/1999/xlink" 
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- a Named Layer is the basic building block of an SLD document -->
  <NamedLayer>
    <Name>default_polygon</Name>
    <UserStyle>
    <!-- Styles can have names, titles and abstracts -->
      <Title>Default Polygon</Title>
      <Abstract>A sample style that draws a polygon</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->
      <!-- A FeatureTypeStyle for rendering polygons -->
      <FeatureTypeStyle>
        <Rule>
          <Name>rule1</Name>
          <Title>Gray Polygon with Black Outline</Title>
          <Abstract>A polygon with a gray fill and a 1 pixel black outline</Abstract>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#AAAAAA</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>water</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>water</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#b3b3ff</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#6666ff</CssParameter>
              <CssParameter name="stroke-width">0.2</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>riverbank</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>riverbank</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#b3b3ff</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#6666ff</CssParameter>
              <CssParameter name="stroke-width">0.2</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>park</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>park</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#d4ff80</CssParameter>
            </Fill>
          </PolygonSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>park</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>park</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#d4ff80</CssParameter>
            </Fill>
          </PolygonSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>forest</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>forest</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#408000</CssParameter>
            </Fill>
          </PolygonSymbolizer>
       </Rule>
     </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>