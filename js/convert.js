function convertToCPSV () {	
	setTimeout( function ()	{	
	    /*Get the value of the active text field*/
	    var textXML = dijit.byId("dijit_form_SimpleTextarea_1");
	    var textJSON = dijit.byId("dijit_form_SimpleTextarea_2");
	    textXML.set("value", transformRDFXMLtoCPSV(textXML.get("value")));
	/*	textJSON.set("value", transformRDFJSONtoCPSV(textJSON.get("value")));*/
    }, 10);
}

function convertToEditor () {
	/*Get the value of the active text field*/
    var textXML = dijit.byId("dijit_form_SimpleTextarea_1");
    var textJSON = dijit.byId("dijit_form_SimpleTextarea_2");
    textXML.set("value", transformRDFXMLtoEditor(textXML.get("value")));
	/*textJSON.set("value", transformRDFJSONtoEditor(textJSON.get("value")));*/
}

function transformRDFXMLtoCPSV(text) {
    var pos, posStart, posEnd = -1; 
    /* Check if there is an ID for the public service, or there is no PS ID but there are attributes for the PS or another entity, or there's nothing about the public service at all*/
    var posStartDescription = text.indexOf('<rdf:Description rdf:about="http://example.com/about">');
    var posIdentifier = text.indexOf("<dcterms:identifier", posStartDescription);
    var posEndDescription = text.indexOf("</rdf:Description>", posStartDescription);
    console.log(posStartDescription + " " + posIdentifier + " " + posEndDescription);
    if (posStartDescription != -1 && posIdentifier != -1 && posEndDescription != -1 && posStartDescription < posIdentifier && posIdentifier < posEndDescription) {
        var posStart = text.indexOf(">", posIdentifier) + 1;
        var posEnd = text.indexOf("<", posStart);
        var identifier = text.substring(posStart, posEnd);
        /*replace with identifier*/
        text = text.replace("http://example.com/about", identifier);
        /*remove identifier and insert <rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>*/
        text = text.replace("<dcterms:identifier>" + identifier + "</dcterms:identifier>", '<rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>');        
    } else if ( (posIdentifier == -1 && posStartDescription != -1 && posEndDescription != -1) || ( posStartDescription != -1 && posIdentifier != -1 && posEndDescription != -1 ) ) {
        /*replace with blank node identifier*/
        text = text.replace("http://example.com/about", "PS_0");
        /*remove identifier and insert <rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>*/
        index = text.indexOf('rdf:about="PS_0">');
        text = text.substr(0, index + 17) + "\n" + '    <rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>' + text.substr(index + 15);
    } else {

    }

    var posStartNodeID, posEndNodeID = -1;
    var nodeID = null;
    /*As long as it finds identifiers, replace them over the whole document*/
    while ( text.indexOf("dcterms:identifier") != -1 ) {

        /*find identifier value*/
        pos = text.indexOf("dcterms:identifier", posEnd);
        posStart = text.indexOf(">", pos) + 1;
        posEnd = text.indexOf("<", posStart);
        identifier = text.substring(posStart, posEnd);
        /*find rdf:nodeID value*/
        posStartNodeID = text.lastIndexOf("nodeID", pos) + 8;
        posEndNodeID = text.indexOf('"', posStartNodeID);
        nodeID = text.substring(posStartNodeID, posEndNodeID);
        console.log(identifier + " " + nodeID);
        /*replace all occurences*/
        while (text.indexOf(nodeID) != -1 ) {
            text = text.replace(nodeID, identifier);
        };
        /*remove identifier*/
        text = text.replace(" <dcterms:identifier>" + identifier + "</dcterms:identifier>", "");
        text = text.replace(/^\s*[\r\n]/gm, "");

    }

    /*Replace all rdf:Description rdf:nodeID with rdf:Description rdf:about*/
    text = text.replace(/rdf:Description rdf:nodeID/g, "rdf:Description rdf:about");

    /*Replace all remaining rdf:nodeID with rdf:resource*/
    text = text.replace(/rdf:nodeID/g, "rdf:resource");

    return text;
}

function transformRDFJSONtoCPSV(text) {
    
}


function transformRDFXMLtoEditor(text) {
    /* Check if there is an ID for the public service*/
    var posPS = text.indexOf('<rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>');
    var posStartDescription = text.lastIndexOf("<rdf:Description", posPS);
    var posIdentifier = text.indexOf('rdf:about=');
    if ( posPS != -1 && posStartDescription != -1 && posIdentifier != -1 && posStartDescription < posIdentifier && posIdentifier < posPS ) {
        /*find identifier*/
        var posStart = text.indexOf('"', posIdentifier) + 1;
        var posEnd = text.indexOf('"', posStart);
        var identifier = text.substring(posStart, posEnd);
        /*replace with example:about*/
        text = text.replace(identifier, "http://example.com/about");
        /*remove <rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/> and insert identifier*/
        text = text.replace('<rdf:type rdf:resource="http://purl.org/vocab/cpsv#PublicService"/>', "<dcterms:identifier>" + identifier + "</dcterms:identifier>");
    } else {

    }

    var posID, posStartID, posEndID, nodeID = -1;
    /*As long as it finds rdf:about, replace them over the whole document*/
    while ( text.split("rdf:about").length - 1 > 1 ) {

        /*find rdf:about*/
        posID = text.indexOf("rdf:about", posEnd);
        posStartID = text.indexOf('"', posID) + 1;
        posEndID = text.indexOf('"', posStartID);
        identifier = text.substring(posStartID, posEndID);
        nodeID = nodeID + 1;
        text = text.replace('rdf:about="' + identifier + '"', 'rdf:nodeID="_n' + nodeID + '">' + "<dcterms:identifier>" + identifier + "</dcterms:identifier>");

        /*replace all occurences of identifier by blank node ID*/
        while (text.split(identifier).length - 1 > 1 ) {
            text = text.replace('rdf:resource="' + identifier, 'rdf:nodeID="_n' + nodeID);
        };
    }  

    return text;
}

function transformRDFJSONtoEditor(text) {
    
}