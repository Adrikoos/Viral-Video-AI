export const dynamic="force-dynamic";
export async function GET(){
  return Response.json({ok:true,configured:Boolean(process.env.RUNWAYML_API_SECRET),provider:"runway",model:"seedance2_5",version:"4.0.0"});
}