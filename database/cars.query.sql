CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gl_id INT,
    g_id INT,
    b_id INT,
    m_id INT,
    gi_id INT,
    ps_id INT,
    d_id INT,
    es_id INT,
    dbss_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


INSERT INTO cars (gl_id, g_id, b_id, m_id, gi_id, ps_id, d_id, es_id, dbss_id)
SELECT 
    gl.id as gl_id, 
    g.id as g_id,
    b.id as b_id,
    m.id as m_id,
    gi.id as gi_id,
    ps.id as ps_id,
    d.id as d_id,
    es.id as es_id,
    dbss.id as dbss_id
FROM 
    generation_links_2 gl
JOIN 
    generations g ON g.id = gl.generation_id
JOIN
    models m ON m.id = g.model_id
JOIN
    brands b ON b.id = m.brand_id 
LEFT JOIN 
    general_information gi ON gl.id = gi.generation_link_id 
LEFT JOIN 
    performance_specs ps ON gl.id = ps.generation_link_id
LEFT JOIN
    engine_specs es ON gl.id = es.generation_link_id 
LEFT JOIN
    dimensions d ON gl.id = d.generation_link_id 
LEFT JOIN 
    drivetrain_brakes_suspension_specs dbss ON gl.id = dbss.generation_link_id;