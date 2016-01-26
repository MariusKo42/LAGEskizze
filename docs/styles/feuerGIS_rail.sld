<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>Simple railway</Name>
    <UserStyle>

      <Title>Default Styler for simple railway segments</Title>
      <FeatureTypeStyle>
        
          <Rule>
       <LineSymbolizer>
         <Stroke>
           <CssParameter name="stroke">#333333</CssParameter>
           <CssParameter name="stroke-width">1.5</CssParameter>
         </Stroke>
       </LineSymbolizer>
       <LineSymbolizer>
         <Stroke>
           <GraphicStroke>
             <Graphic>
               <Mark>
                 <WellKnownName>shape://vertline</WellKnownName>
                 <Stroke>
                   <CssParameter name="stroke">#333333</CssParameter>
                   <CssParameter name="stroke-width">0.6</CssParameter>
                 </Stroke>
               </Mark>
               <Size>12</Size>
             </Graphic>
           </GraphicStroke>
         </Stroke>
       </LineSymbolizer>
     </Rule>
        
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>