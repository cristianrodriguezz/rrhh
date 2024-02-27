const getCandidatesQuery = (selectFields) => {
  const { limit, offset, user_id, q } = selectFields;

  const select = [];
  const selectPagination = []
  const values = [];
  const valuesDefect = [];

  let selectQuery;

  // Añadir valores defecto solo si existen en selectFields
  if (user_id !== undefined) valuesDefect.push(user_id);
  if (q !== undefined) valuesDefect.push(q);

  valuesDefect.push(limit, offset)

  for (const key in selectFields) {
    if (key !== 'user_id' && key !== 'q' && key !== 'limit' && key !== 'offset') {
      select.push(`AND ${key} = $${values.length + 5}`);
      values.push(selectFields[key]);
      selectPagination.push(`AND ${key} = $${values.length}`)
    }
  }



  if (select.length === 0) {
    selectQuery = `
      SELECT 
        c.candidate_id,
        c.first_name,
        c.last_name,
        c.age,
        c.phone_number,
        c.has_own_transport,
        c.has_work_experience,
        e.education,
        av.availability_schedule,
        c.upload_date,
        c.user_id,
        c.cuil,
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link,
        po.current_position
      FROM 
        public."Candidates" c
      LEFT JOIN 
        public."Cvs" cv ON c.candidate_id = cv.candidate_id
      LEFT JOIN 
        public."Education" e ON c.education_id = e.education_id
      LEFT JOIN 
        public."Availability" av ON c.availability_id = av.availability_id
      LEFT JOIN 
        public."Positions" po ON c.current_position_id = po.current_position_id
      LEFT JOIN 
        public."CandidateStatus" cs ON c.status_id = cs.status_id
      LEFT JOIN 
        public."Location" l ON c.location_id = l.location_id
      WHERE 
        c.user_id = $1
        AND (c.first_name ILIKE '%' || $2 || '%' OR c.last_name ILIKE '%' || $2 || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $2 || '%')
      ORDER BY c.upload_date DESC
      LIMIT $3 OFFSET $4
    `;
  } else {

    selectQuery = `
      SELECT 
        c.candidate_id,
        c.first_name,
        c.last_name,
        c.age,
        c.phone_number,
        c.has_own_transport,
        c.has_work_experience,
        e.education,
        av.availability_schedule,
        c.upload_date,
        c.user_id,
        c.cuil,
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link,
        po.current_position
      FROM 
        public."Candidates" c
      LEFT JOIN 
        public."Cvs" cv ON c.candidate_id = cv.candidate_id
      LEFT JOIN 
        public."Education" e ON c.education_id = e.education_id
      LEFT JOIN 
        public."Availability" av ON c.availability_id = av.availability_id
      LEFT JOIN 
        public."Positions" po ON c.current_position_id = po.current_position_id
      LEFT JOIN 
        public."CandidateStatus" cs ON c.status_id = cs.status_id
      LEFT JOIN 
        public."Location" l ON c.location_id = l.location_id
      WHERE 
        c.user_id = $1
        AND (c.first_name ILIKE '%' || $2 || '%' OR c.last_name ILIKE '%' || $2 || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $2 || '%')
        ${select.join(' ')}
      ORDER BY c.upload_date DESC
      LIMIT $3 OFFSET $4
    `;
  }

  const combinedValues = [...valuesDefect, ...values];


  const totalPagesQuery = `
  WITH filtered_candidates AS (
    SELECT 
      c.candidate_id,
      c.first_name,
      c.last_name,
      c.age,
      c.phone_number,
      c.has_own_transport,
      c.has_work_experience,
      e.education,
      av.availability_schedule,
      c.upload_date,
      c.user_id,
      c.cuil,
      l.name AS location,
      cs.name AS status,
      cv.link AS cv_link,
      po.current_position
    FROM 
      public."Candidates" c
    LEFT JOIN 
      public."Cvs" cv ON c.candidate_id = cv.candidate_id
    LEFT JOIN 
      public."Education" e ON c.education_id = e.education_id
    LEFT JOIN 
      public."Availability" av ON c.availability_id = av.availability_id
    LEFT JOIN 
      public."Positions" po ON c.current_position_id = po.current_position_id
    LEFT JOIN 
      public."CandidateStatus" cs ON c.status_id = cs.status_id
    LEFT JOIN 
      public."Location" l ON c.location_id = l.location_id
    WHERE 
      c.user_id = ${user_id}
      AND (c.first_name ILIKE '%' || '${q}' || '%' OR c.last_name ILIKE '%' || '${q}' || '%' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || '${q}' || '%')
      ${selectPagination.join(' ')}
    )
    SELECT CEIL(COUNT(*)::float / ${limit}) AS total_pages
    FROM filtered_candidates
    `;


  return { selectQuery, combinedValues, totalPagesQuery, values };
}


const buildUpdateQuery = (data, user_id, candidate_id) => {
  let text = 'UPDATE public."Candidates" SET'
  let values = []
  let index = 1

  const hasNonEmptyValue = Object.values(data).some(value => value !== undefined && value !== null && value !== '')

  if (!hasNonEmptyValue) {
    return { text: '', values: [] }
  }

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      text += ` ${key} = $${index},`
      values.push(value)
      index++
    }
  })
  
  text = text.slice(0, -1) + ` WHERE user_id = $${index} and candidate_id = $${index + 1} `
  values.push(user_id, candidate_id)

  console.log(text);

  return { text, values }
}
function buildQuery(candidateIds, userId) {
  // Generar la parte de la consulta SQL para los candidate_id
  const candidateIdFilter = candidateIds.map((_, index) => `$${index + 2}`).join(',');

  // Construir la consulta SQL
  const query = {
    text: `SELECT 
      c.candidate_id id,
      c.first_name nombre,
      c.last_name apellido,
      c.age fecha_de_nacimiento,
      c.phone_number teléfono,
      c.has_own_transport tiene_transporte,
      c.has_work_experience tiene_experiencia,
      e.education educación,
      av.availability_schedule disponibilidad,
      c.upload_date fecha_de_carga,
      c.cuil cuil,
      l.name AS localidad,
      cv.link AS cv,
      po.current_position posición
    FROM 
      public."Candidates" c
    LEFT JOIN 
      public."Cvs" cv ON c.candidate_id = cv.candidate_id
    LEFT JOIN 
      public."Education" e ON c.education_id = e.education_id
    LEFT JOIN 
      public."Availability" av ON c.availability_id = av.availability_id
    LEFT JOIN 
      public."Positions" po ON c.current_position_id = po.current_position_id
    LEFT JOIN 
      public."CandidateStatus" cs ON c.status_id = cs.status_id
    LEFT JOIN 
      public."Location" l ON c.location_id = l.location_id
    WHERE 
      c.user_id = $1
      AND c.candidate_id IN (${candidateIdFilter})`,
    values: [userId, ...candidateIds]
  };

  return query;
}

module.exports = { getCandidatesQuery, buildUpdateQuery, buildQuery };
