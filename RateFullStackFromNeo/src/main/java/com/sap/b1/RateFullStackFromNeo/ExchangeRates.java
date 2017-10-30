package com.sap.b1.RateFullStackFromNeo;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

//import org.dom4j.Document;
//import org.dom4j.Node;
//import org.dom4j.io.SAXReader;

import net.sf.json.JSONObject;


@WebServlet("/exchangeRates")
public class ExchangeRates extends HttpServlet  {


	private static final long serialVersionUID = -1034411278311586458L;
	private static String sid=null;
	private static String today = new SimpleDateFormat("yyyyMMdd").format(new Date());
	
	/**
	 * eg: environment variable is B1_SERVICE_LAYER=10.58.1.118
	 * here we have to use http and 50001 to avoid SSL issue
	 */
	private static String serviceLayer = "http://" + System.getenv().get("B1_SERVICE_LAYER") + ":50001/b1s/v1/";
	//private static String serviceLayer = "http://10.58.3.22:50001/b1s/v1/";
	
	public void doGet (HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		login();
		List<String> currencyCodes = new ArrayList<String>();
		List<JSONObject> ExchangeRateList = new ArrayList<JSONObject>();
		if (request.getParameter("systemExchangeRates") != null){
			currencyCodes = Arrays.asList(request.getParameter("systemExchangeRates").split(","));
			ExchangeRateList = getSystemExchangeRates(currencyCodes);
		}
		else if(request.getParameter("lastestExchangeRates") != null){
			currencyCodes = Arrays.asList(request.getParameter("lastestExchangeRates").split(","));
			ExchangeRateList = getLatestExchangeRates(currencyCodes);
		}
		OutputStream outputStream = response.getOutputStream();
		byte[] dataByteArr = ExchangeRateList.toString().getBytes("UTF-8");
		outputStream.write(dataByteArr);
	}
	
	public List<JSONObject> getSystemExchangeRates(List<String> CurrencyCodes){
		List<JSONObject> jList = new ArrayList<JSONObject>();
		for (String currencyCode : CurrencyCodes){
			String rate = getSingleSystemExchangeRate(currencyCode, today);
			JSONObject currObj = new JSONObject();
			currObj.element("CurrencyCode", currencyCode);
			currObj.element("Name", this.getCurrDes(currencyCode));
			currObj.element("Rate", rate);
			jList.add(currObj);
		}
		return jList;
	}
	
	public String getSingleSystemExchangeRate(String CurrencyCode, String date){
		String rate=null;
		if (sid == null){
			login();
		}
		DataOutputStream out = null;
        BufferedReader in = null;
        try {
        	String cookie = "B1SESSION=" + sid;
            URL realUrl = new URL(serviceLayer + "SBOBobService_GetCurrencyRate");
            HttpURLConnection  conn = (HttpURLConnection) realUrl.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("Content-Type", "application/json;odata=minimalmetadata;charset=utf-8");
            conn.setRequestProperty("user-agent",  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            conn.setRequestProperty("Cookie", cookie);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            out = new DataOutputStream(conn.getOutputStream());
            JSONObject obj = new JSONObject();
            obj.element("Currency", CurrencyCode);
            obj.element("Date", date);
            out.writeBytes(obj.toString());
            out.flush();
            out.close();
            in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String lines;
            StringBuffer sb = new StringBuffer("");
            while ((lines = in.readLine()) != null) {
                lines = new String(lines.getBytes(), "utf-8");
                sb.append(lines);
            }
            rate = sb.toString();
            in.close();
            conn.disconnect();
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
        }
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return rate;
	}
	
	private String login(){
		DataOutputStream out = null;
        BufferedReader in = null;
        String result = "";
        String url = serviceLayer+"Login";
        System.out.println("------------------------------------" +url+"------------------------------------");
        try {
            URL realUrl = new URL(url);
            HttpURLConnection  conn = (HttpURLConnection) realUrl.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            conn.setDoOutput(true);
            conn.setDoInput(true);
            out = new DataOutputStream(conn.getOutputStream());
            JSONObject obj = new JSONObject();
            obj.element("CompanyDB", "SBODEMOUS");
            obj.element("Password", "manager");
            obj.element("UserName", "manager");
            out.writeBytes(obj.toString());
            out.flush();
            out.close();
            in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String lines;
            StringBuffer sb = new StringBuffer("");
            while ((lines = in.readLine()) != null) {
                lines = new String(lines.getBytes(), "utf-8");
                sb.append(lines);
            }
            System.out.println(sb);
            JSONObject loginData=JSONObject.fromObject(sb.toString());
            sid = (String) loginData.get("SessionId");
            in.close();
            conn.disconnect();
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
        }
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return result;
	}
	
	public List<JSONObject> getLatestExchangeRates(List<String> CurrencyCodes){
		List<JSONObject> jList = new ArrayList<JSONObject>();
		DataOutputStream out = null;
        BufferedReader in = null;
        try {
//        	URL realUrl = new URL("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%28\"EURUSD\",\"EURGBP\",\"EURILS\",\"EURCAD\"%29&env=store://datatables.org/alltableswithkeys");
        	URL realUrl = new URL("http://api.fixer.io/latest?base=EUR");	//change yahoo api to fixer's as yahoo's instability
            HttpURLConnection  conn = (HttpURLConnection) realUrl.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            conn.setDoOutput(true);
            conn.setDoInput(true);
            
            in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                       
            String lines;
            StringBuffer sb = new StringBuffer("");
            while ((lines = in.readLine()) != null) {
                lines = new String(lines.getBytes(), "utf-8");
                sb.append(lines);
            }
            System.out.println(sb);
            in.close();
            conn.disconnect();            
       
            Gson gson = new Gson();          
            Type type = new TypeToken<ExchangeRateTransfer>() {}.getType();
            ExchangeRateTransfer o = (ExchangeRateTransfer)gson.fromJson(sb.toString(), type);
            System.out.println(o.getBase());         
            
    		List<String> Currencies = new ArrayList<String>();
    		Currencies.add("USD");
    		Currencies.add("GBP");
    		Currencies.add("ILS");
    		Currencies.add("CAD");
            
            for(int i=0;i< Currencies.size();i++)
            {
    			JSONObject currObj = new JSONObject();
    			String currencyCode =  Currencies.get(i);
    			currObj.element("CurrencyCode",currencyCode);
    			currObj.element("Name", this.getCurrDes(currencyCode));
    			//String rate = getSingleSystemExchangeRate(currencyCode, today);
    			//currObj.element("Rate", rate);
    			String latestExchangeRate = o.getRates().get(currencyCode);
    			currObj.element("latestExchangeRate", latestExchangeRate);
    			jList.add(currObj);
            }
           
//            SAXReader reader = new SAXReader();
//            Document doc = reader.read(new ByteArrayInputStream(sb.toString().getBytes()));
//            List<Node> nodes = doc.selectNodes("//query/results/rate");
//            for (Node node : nodes){
//            	String currencyCode=node.selectSingleNode("Name").getText().split("/")[1];
//            	String latestExchangeRate = node.selectSingleNode("Rate").getText();
//	            	String rate = getSingleSystemExchangeRate(currencyCode, today);
//	    			JSONObject currObj = new JSONObject();
//	    			currObj.element("CurrencyCode", currencyCode);
//	    			currObj.element("Name", this.getCurrDes(currencyCode));
//	    			currObj.element("Rate", rate);
//	    			currObj.element("latestExchangeRate", latestExchangeRate);
////	            	Map<String, String> m = new HashMap<String, String>();
////	            	m.put(node.selectSingleNode("Name").getText().split("/")[1], node.selectSingleNode("Rate").getText());
//	    			jList.add(currObj);
//            }
            
            
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
        }
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return jList;
	}

	public void doPost (HttpServletRequest request, HttpServletResponse response)	throws ServletException, IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		List<String> CurrencyCodes = new ArrayList<String>();
		CurrencyCodes.add("USD");
		CurrencyCodes.add("GBP");
		CurrencyCodes.add("ILS");
		CurrencyCodes.add("CAD");
		List<JSONObject> currencyMapList = this.getLatestExchangeRates(CurrencyCodes);
		for (JSONObject m : currencyMapList){
			String CurrencyCode=m.getString("CurrencyCode");
			String rate = m.getString("latestExchangeRate");
			
			updateSystemCurrencyRate(CurrencyCode,rate);
		}
	}
	
	private void updateSystemCurrencyRate(String CurrencyCode, String rate){
		if (sid == null){
			login();
		}
		DataOutputStream out = null;
        BufferedReader in = null;
        try {
        	String cookie = "B1SESSION=" + sid;
            URL realUrl = new URL(serviceLayer+"SBOBobService_SetCurrencyRate");
            HttpURLConnection  conn = (HttpURLConnection) realUrl.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("Content-Type", "application/json;odata=minimalmetadata;charset=utf-8");
            conn.setRequestProperty("user-agent",  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            conn.setRequestProperty("Cookie", cookie);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            out = new DataOutputStream(conn.getOutputStream());
            JSONObject obj = new JSONObject();
            obj.element("Currency", CurrencyCode);
            obj.element("Rate", rate);
            obj.element("RateDate", today);
            out.writeBytes(obj.toString());
            out.flush();
            out.close();
            System.out.println(conn.getResponseCode()); // status code is 204, means OK.
            conn.disconnect();
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
        }
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        
	}
	
	private String getCurrDes(String name){
	  String des="";
	   if (name.equals("USD")){
	      des="US dollar";
	   }else if(name.equals("GBP")){ 
	     des="Pound Sterling";
	   }else if(name.equals("ILS")){
	     des="Israeli shekel";
	   }else if(name.equals("CAD")){
	     des="Canadian dollar";
	   }
	  return des;		
	}
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		//updateSystemCurrencyRate("USD","1.7890");
		//System.out.println(serviceLayer);
	}

}
