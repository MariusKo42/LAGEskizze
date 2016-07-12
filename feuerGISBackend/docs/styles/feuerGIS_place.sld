<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>feuerGIS_place</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <MaxScaleDenominator>136000</MaxScaleDenominator>
          <TextSymbolizer>
         <Label>
           <ogc:PropertyName>name</ogc:PropertyName>
         </Label>
            <Halo>
              </Halo>
            <Font>
           <CssParameter name="font-family">Arial</CssParameter>
           <CssParameter name="font-size">16</CssParameter>
           <CssParameter name="font-style">normal</CssParameter>
           <CssParameter name="font-weight">bold</CssParameter>
         </Font>
          
         <Fill>
           <CssParameter name="fill">#000000</CssParameter>
         </Fill>
              
       </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
      <FeatureTypeStyle>
        <Rule>
          <Filter>
         <PropertyIsGreaterThan>
           <ogc:PropertyName>population</ogc:PropertyName>
           <ogc:Literal>10000</ogc:Literal>
         </PropertyIsGreaterThan>
       </Filter>
          <MinScaleDenominator>136000</MinScaleDenominator>
          <TextSymbolizer>
         <Label>
           <ogc:PropertyName>name</ogc:PropertyName>
         </Label>
            <Halo>
              </Halo>
            <Font>
           <CssParameter name="font-family">Arial</CssParameter>
           <CssParameter name="font-size">16</CssParameter>
           <CssParameter name="font-style">normal</CssParameter>
           <CssParameter name="font-weight">bold</CssParameter>
         </Font>
          
         <Fill>
           <CssParameter name="fill">#000000</CssParameter>
         </Fill>
              
       </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>