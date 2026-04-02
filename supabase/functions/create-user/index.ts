import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("SUPABASE_URL present:", !!supabaseUrl);
    console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!serviceRoleKey);

    if (!supabaseUrl || !serviceRoleKey) {
      // Try alternative env var names
      const altUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SB_URL");
      const altKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");
      console.log("Available env vars:", JSON.stringify(Object.keys(Deno.env.toObject()).filter(k => k.includes("SUPA") || k.includes("SERVICE") || k.includes("SB_"))));
      
      return new Response(JSON.stringify({ 
        error: "Server configuration error - missing environment variables",
        debug: { hasUrl: !!supabaseUrl, hasKey: !!serviceRoleKey }
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller identity from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller has permission
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    const allowedRoles = ["top_level", "group_lead", "team_lead"];
    if (!callerRole || !allowedRoles.includes(callerRole.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, role, team_name } = await req.json();

    if (!name || !email || !role) {
      return new Response(JSON.stringify({ error: "Name, email, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser.user.id;

    if (role !== "employee") {
      await adminClient.from("user_roles").update({ role }).eq("user_id", userId);
    }

    if (team_name) {
      await adminClient.from("profiles").update({ team_name }).eq("user_id", userId);
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
