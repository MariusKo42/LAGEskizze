<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>Simple Roads</Name>
    <UserStyle>

      <Title>Default Styler for simple road segments</Title>
      <Abstract>TODO: change</Abstract>
      <FeatureTypeStyle>
        <Rule>
          <LineSymbolizer>
            <MinScaleDenominator>360000000</MinScaleDenominator>
            <Stroke>
              <CssParameter name="stroke">
                <ogc:Literal>#d9d9d9</ogc:Literal>
              </CssParameter>
              <CssParameter name="stroke-width">
                <ogc:Literal>1</ogc:Literal>
              </CssParameter>
            </Stroke>
          </LineSymbolizer>
          <TextSymbolizer>
           <Label>
             <ogc:PropertyName>name</ogc:PropertyName>
           </Label>
           <LabelPlacement>
             <LinePlacement />
           </LabelPlacement>
           <Fill>
             <CssParameter name="fill">#000000</CssParameter>
           </Fill>
           <Font>
             <CssParameter name="font-family">Arial</CssParameter>
             <CssParameter name="font-size">10</CssParameter>
             <CssParameter name="font-style">normal</CssParameter>
             <CssParameter name="font-weight">bold</CssParameter>
           </Font>
           <VendorOption name="followLine">true</VendorOption>
           <VendorOption name="maxAngleDelta">90</VendorOption>
           <VendorOption name="maxDisplacement">400</VendorOption>
           <VendorOption name="repeat">150</VendorOption>
         </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>motorway</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>motorway</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#3366ff</CssParameter>
             <CssParameter name="stroke-width">3</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>motorway_link</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>motorway_link</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#3366ff</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>trunk</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>trunk</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#75a3a3</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>primary</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>primary</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#ac3a3a</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle> 
     <FeatureTypeStyle>
       <Rule>
         <Name>secondary</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>secondary</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#339966</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle> 
      <FeatureTypeStyle>
       <Rule>
         <Name>tertiary</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>tertiary</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#999966</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle> 
      <FeatureTypeStyle>
       <Rule>
         <Name>residential</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>residential</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
             <CssParameter name="stroke">#b3b3b3</CssParameter>
             <CssParameter name="stroke-width">2</CssParameter>
           </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>cycleway</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>cycleway</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
           <CssParameter name="stroke">#80beff</CssParameter>
           <CssParameter name="stroke-width">1</CssParameter>
           <CssParameter name="stroke-dasharray">5 2</CssParameter>
         </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
      <FeatureTypeStyle>
       <Rule>
         <Name>footway</Name>
         <ogc:Filter>
           <ogc:PropertyIsEqualTo>
             <ogc:PropertyName>type</ogc:PropertyName>
             <ogc:Literal>footway</ogc:Literal>
           </ogc:PropertyIsEqualTo>
         </ogc:Filter>
         <LineSymbolizer>
           <Stroke>
           <CssParameter name="stroke">#ffb366</CssParameter>
           <CssParameter name="stroke-width">1</CssParameter>
           <CssParameter name="stroke-dasharray">5 2</CssParameter>
         </Stroke>
         </LineSymbolizer>
       </Rule>
     </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>