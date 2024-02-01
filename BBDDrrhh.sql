PGDMP     *                    |            rrhh    15.4    15.4 A    R           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            S           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            T           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            U           1262    26956    rrhh    DATABASE     {   CREATE DATABASE rrhh WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Argentina.1252';
    DROP DATABASE rrhh;
                postgres    false            u           1247    27115    candidate_data_type    TYPE     �  CREATE TYPE public.candidate_data_type AS (
	candidate_id integer,
	first_name character varying,
	last_name character varying,
	age integer,
	phone_number character varying,
	has_own_transport boolean,
	has_work_experience boolean,
	education character varying,
	availability_schedule character varying,
	upload_date timestamp with time zone,
	user_id integer,
	location character varying,
	status character varying,
	cv_link character varying
);
 &   DROP TYPE public.candidate_data_type;
       public          postgres    false            r           1247    27093    data_result_type    TYPE     �   CREATE TYPE public.data_result_type AS (
	candidate_id integer,
	candidate_name character varying,
	cv_id integer,
	cv_link character varying
);
 #   DROP TYPE public.data_result_type;
       public          postgres    false            �            1255    27217 3   get_data_with_pagination(integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.get_data_with_pagination(page_number integer, page_size integer, iduser integer) RETURNS TABLE(result public.candidate_data_type)
    LANGUAGE plpgsql
    AS $$
DECLARE
    offset_val INT;
BEGIN
    -- Calcular el OFFSET para la página actual
    offset_val := (page_number - 1) * page_size;

    -- Consulta con paginación y LEFT JOIN
    RETURN QUERY
    SELECT 
        c.candidate_id,
        c.first_name,
        c.last_name,
        c.age,
        c.phone_number,
        c.has_own_transport,
        c.has_work_experience,
        e.education,  -- Suponiendo que "Education" tiene una columna llamada "education_name"
        av.availability_schedule,
        c.upload_date,
        c.user_id,
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link
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
	WHERE c.user_id = idUser
    ORDER BY c.upload_date DESC
    LIMIT page_size OFFSET offset_val;
END;
$$;
 g   DROP FUNCTION public.get_data_with_pagination(page_number integer, page_size integer, iduser integer);
       public          postgres    false    885            �            1255    27218 F   get_data_with_pagination(integer, integer, integer, character varying)    FUNCTION     �  CREATE FUNCTION public.get_data_with_pagination(page_number integer, page_size integer, iduser integer, search_name character varying) RETURNS TABLE(result public.candidate_data_type)
    LANGUAGE plpgsql
    AS $$
DECLARE
    offset_val INT;
BEGIN
    -- Calcular el OFFSET para la página actual
    offset_val := (page_number - 1) * page_size;

    -- Consulta con paginación y LEFT JOIN
    RETURN QUERY
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
        l.name AS location,
        cs.name AS status,
        cv.link AS cv_link
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
        c.user_id = idUser
        AND (c.first_name ILIKE '%' || search_name || '%' OR c.last_name ILIKE '%' || search_name || '%')
    ORDER BY c.upload_date DESC
    LIMIT page_size OFFSET offset_val;
END;
$$;
 �   DROP FUNCTION public.get_data_with_pagination(page_number integer, page_size integer, iduser integer, search_name character varying);
       public          postgres    false    885            �            1255    27172 !   get_total_pages(integer, integer)    FUNCTION     {  CREATE FUNCTION public.get_total_pages(page_size integer, iduser integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_records INT;
    total_pages INT;
BEGIN
    SELECT COUNT(*)
    INTO total_records
    FROM public."Candidates" c
    WHERE c.user_id = idUser;

    total_pages := CEIL(total_records::NUMERIC / page_size);

    RETURN total_pages;
END;
$$;
 I   DROP FUNCTION public.get_total_pages(page_size integer, iduser integer);
       public          postgres    false            �            1259    26972    Availability    TABLE     ~   CREATE TABLE public."Availability" (
    availability_id integer NOT NULL,
    availability_schedule character varying(50)
);
 "   DROP TABLE public."Availability";
       public         heap    postgres    false            �            1259    27078    CandidateStatus    TABLE     s   CREATE TABLE public."CandidateStatus" (
    status_id integer NOT NULL,
    name character varying(30) NOT NULL
);
 %   DROP TABLE public."CandidateStatus";
       public         heap    postgres    false            �            1259    27077    CandidateStatus_status_id_seq    SEQUENCE     �   ALTER TABLE public."CandidateStatus" ALTER COLUMN status_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."CandidateStatus_status_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    230            �            1259    26986 
   Candidates    TABLE     �  CREATE TABLE public."Candidates" (
    candidate_id integer NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    age integer,
    phone_number character varying(25),
    has_own_transport boolean,
    has_work_experience boolean,
    education_id integer,
    availability_id integer,
    upload_date timestamp with time zone,
    user_id integer,
    location_id integer,
    current_position_id integer,
    status_id integer
);
     DROP TABLE public."Candidates";
       public         heap    postgres    false            �            1259    27030    Candidates_candidate_id_seq    SEQUENCE     �   ALTER TABLE public."Candidates" ALTER COLUMN candidate_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Candidates_candidate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    219            �            1259    27045    Cvs    TABLE     {   CREATE TABLE public."Cvs" (
    id integer NOT NULL,
    link character varying(300) NOT NULL,
    candidate_id integer
);
    DROP TABLE public."Cvs";
       public         heap    postgres    false            �            1259    27044 
   Cvs_id_seq    SEQUENCE     �   ALTER TABLE public."Cvs" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Cvs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    224            �            1259    26965 	   Education    TABLE     q   CREATE TABLE public."Education" (
    education_id integer NOT NULL,
    education character varying NOT NULL
);
    DROP TABLE public."Education";
       public         heap    postgres    false            �            1259    27056    Location    TABLE     n   CREATE TABLE public."Location" (
    location_id integer NOT NULL,
    name character varying(40) NOT NULL
);
    DROP TABLE public."Location";
       public         heap    postgres    false            �            1259    27055    Location_id_location_seq    SEQUENCE     �   ALTER TABLE public."Location" ALTER COLUMN location_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Location_id_location_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    226            �            1259    27067 	   Positions    TABLE     �   CREATE TABLE public."Positions" (
    current_position_id integer NOT NULL,
    current_position character varying(70) NOT NULL
);
    DROP TABLE public."Positions";
       public         heap    postgres    false            �            1259    27066 !   Positions_current_position_id_seq    SEQUENCE     �   ALTER TABLE public."Positions" ALTER COLUMN current_position_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Positions_current_position_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    228            �            1259    27018    Users    TABLE     �   CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(40),
    lastname character varying(40),
    username character varying(50) NOT NULL,
    email character varying(40) NOT NULL,
    password character varying(200)
);
    DROP TABLE public."Users";
       public         heap    postgres    false            �            1259    27027    Users_id_seq    SEQUENCE     �   ALTER TABLE public."Users" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    220            �            1259    26971     availability_availability_id_seq    SEQUENCE     �   CREATE SEQUENCE public.availability_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.availability_availability_id_seq;
       public          postgres    false    217            V           0    0     availability_availability_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.availability_availability_id_seq OWNED BY public."Availability".availability_id;
          public          postgres    false    216            �            1259    26985    candidates_candidate_id_seq    SEQUENCE     �   CREATE SEQUENCE public.candidates_candidate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.candidates_candidate_id_seq;
       public          postgres    false    219            W           0    0    candidates_candidate_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.candidates_candidate_id_seq OWNED BY public."Candidates".candidate_id;
          public          postgres    false    218            �            1259    26964    education_education_id_seq    SEQUENCE     �   CREATE SEQUENCE public.education_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.education_education_id_seq;
       public          postgres    false    215            X           0    0    education_education_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.education_education_id_seq OWNED BY public."Education".education_id;
          public          postgres    false    214            �           2604    26975    Availability availability_id    DEFAULT     �   ALTER TABLE ONLY public."Availability" ALTER COLUMN availability_id SET DEFAULT nextval('public.availability_availability_id_seq'::regclass);
 M   ALTER TABLE public."Availability" ALTER COLUMN availability_id DROP DEFAULT;
       public          postgres    false    216    217    217            �           2604    26968    Education education_id    DEFAULT     �   ALTER TABLE ONLY public."Education" ALTER COLUMN education_id SET DEFAULT nextval('public.education_education_id_seq'::regclass);
 G   ALTER TABLE public."Education" ALTER COLUMN education_id DROP DEFAULT;
       public          postgres    false    215    214    215            B          0    26972    Availability 
   TABLE DATA           P   COPY public."Availability" (availability_id, availability_schedule) FROM stdin;
    public          postgres    false    217   �\       O          0    27078    CandidateStatus 
   TABLE DATA           <   COPY public."CandidateStatus" (status_id, name) FROM stdin;
    public          postgres    false    230   %]       D          0    26986 
   Candidates 
   TABLE DATA           �   COPY public."Candidates" (candidate_id, first_name, last_name, age, phone_number, has_own_transport, has_work_experience, education_id, availability_id, upload_date, user_id, location_id, current_position_id, status_id) FROM stdin;
    public          postgres    false    219   c]       I          0    27045    Cvs 
   TABLE DATA           7   COPY public."Cvs" (id, link, candidate_id) FROM stdin;
    public          postgres    false    224   c       @          0    26965 	   Education 
   TABLE DATA           >   COPY public."Education" (education_id, education) FROM stdin;
    public          postgres    false    215   xc       K          0    27056    Location 
   TABLE DATA           7   COPY public."Location" (location_id, name) FROM stdin;
    public          postgres    false    226   �c       M          0    27067 	   Positions 
   TABLE DATA           L   COPY public."Positions" (current_position_id, current_position) FROM stdin;
    public          postgres    false    228   �d       E          0    27018    Users 
   TABLE DATA           P   COPY public."Users" (id, name, lastname, username, email, password) FROM stdin;
    public          postgres    false    220   ~e       Y           0    0    CandidateStatus_status_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."CandidateStatus_status_id_seq"', 3, true);
          public          postgres    false    229            Z           0    0    Candidates_candidate_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."Candidates_candidate_id_seq"', 148, true);
          public          postgres    false    222            [           0    0 
   Cvs_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public."Cvs_id_seq"', 3, true);
          public          postgres    false    223            \           0    0    Location_id_location_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public."Location_id_location_seq"', 18, true);
          public          postgres    false    225            ]           0    0 !   Positions_current_position_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public."Positions_current_position_id_seq"', 16, true);
          public          postgres    false    227            ^           0    0    Users_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public."Users_id_seq"', 4, true);
          public          postgres    false    221            _           0    0     availability_availability_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public.availability_availability_id_seq', 4, true);
          public          postgres    false    216            `           0    0    candidates_candidate_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.candidates_candidate_id_seq', 1, false);
          public          postgres    false    218            a           0    0    education_education_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.education_education_id_seq', 6, true);
          public          postgres    false    214            �           2606    27082 $   CandidateStatus CandidateStatus_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public."CandidateStatus"
    ADD CONSTRAINT "CandidateStatus_pkey" PRIMARY KEY (status_id);
 R   ALTER TABLE ONLY public."CandidateStatus" DROP CONSTRAINT "CandidateStatus_pkey";
       public            postgres    false    230            �           2606    27049    Cvs Cvs_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."Cvs"
    ADD CONSTRAINT "Cvs_pkey" PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."Cvs" DROP CONSTRAINT "Cvs_pkey";
       public            postgres    false    224            �           2606    27060    Location Location_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (location_id);
 D   ALTER TABLE ONLY public."Location" DROP CONSTRAINT "Location_pkey";
       public            postgres    false    226            �           2606    27071    Positions Positions_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public."Positions"
    ADD CONSTRAINT "Positions_pkey" PRIMARY KEY (current_position_id);
 F   ALTER TABLE ONLY public."Positions" DROP CONSTRAINT "Positions_pkey";
       public            postgres    false    228            �           2606    27024    Users Users_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);
 C   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_email_key";
       public            postgres    false    220            �           2606    27022    Users Users_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_pkey";
       public            postgres    false    220            �           2606    27026    Users Users_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);
 F   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_username_key";
       public            postgres    false    220            �           2606    26977    Availability availability_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public."Availability"
    ADD CONSTRAINT availability_pkey PRIMARY KEY (availability_id);
 J   ALTER TABLE ONLY public."Availability" DROP CONSTRAINT availability_pkey;
       public            postgres    false    217            �           2606    26991    Candidates candidates_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (candidate_id);
 F   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_pkey;
       public            postgres    false    219            �           2606    26970    Education education_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT education_pkey PRIMARY KEY (education_id);
 D   ALTER TABLE ONLY public."Education" DROP CONSTRAINT education_pkey;
       public            postgres    false    215            �           2606    27050    Cvs candidate_id-fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Cvs"
    ADD CONSTRAINT "candidate_id-fkey" FOREIGN KEY (candidate_id) REFERENCES public."Candidates"(candidate_id) NOT VALID;
 C   ALTER TABLE ONLY public."Cvs" DROP CONSTRAINT "candidate_id-fkey";
       public          postgres    false    219    224    3227            �           2606    26997 *   Candidates candidates_availability_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_availability_id_fkey FOREIGN KEY (availability_id) REFERENCES public."Availability"(availability_id);
 V   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_availability_id_fkey;
       public          postgres    false    3225    219    217            �           2606    27072 .   Candidates candidates_current_position_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_current_position_id_fkey FOREIGN KEY (current_position_id) REFERENCES public."Positions"(current_position_id) NOT VALID;
 Z   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_current_position_id_fkey;
       public          postgres    false    3239    219    228            �           2606    26992 '   Candidates candidates_education_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_education_id_fkey FOREIGN KEY (education_id) REFERENCES public."Education"(education_id);
 S   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_education_id_fkey;
       public          postgres    false    3223    215    219            �           2606    27061 &   Candidates candidates_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_location_id_fkey FOREIGN KEY (location_id) REFERENCES public."Location"(location_id) NOT VALID;
 R   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_location_id_fkey;
       public          postgres    false    219    3237    226            �           2606    27083 $   Candidates candidates_status_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_status_id_fkey FOREIGN KEY (status_id) REFERENCES public."CandidateStatus"(status_id) NOT VALID;
 P   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_status_id_fkey;
       public          postgres    false    230    219    3241            �           2606    27039 "   Candidates candidates_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Candidates"
    ADD CONSTRAINT candidates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."Users"(id) NOT VALID;
 N   ALTER TABLE ONLY public."Candidates" DROP CONSTRAINT candidates_user_id_fkey;
       public          postgres    false    3231    220    219            B   K   x�3��L�-�WH��-�I-��2��MM��W(�ss�e�+��*��&�%r�p����+��'��\1z\\\ |Lo      O   .   x�3���,JM�2���(�O/J-.�2�,I-���K,���qqq ��      D   �  x���Ao#7Fϓ_��"�HI�4Ƕh�EQ,z�K�$��p�K}93{EO�l l�p$>Q�0�w�_�_wCK�MYoKmax�Gx� �6�-�O,ccʷaz����&���^�/����O�1�Ly�)2}�������/�q
Oq��܈s\b]A�PJ�Ձڅ�8fce���p��F.#'Җ�/!�D�úW&3F�_�O�oO��kw���>�� �1��b�7��7�JQ>BKsp7���{{��~�♣��G��T���%���!c�
LxC���z�K`�z`S����\pM=���(.º	��6�y�y�LQy�}d6(6��Z�!�H��<����?��z�����td�N+p�k��I���MQ��iC�=pS����6=��g�ꁛ�\ ,�7=� ��7=9�(�~��' ]�qӓ�y�B��:^�Ic�$�Ex�'P[ϻ^��WUz���dYI��\����]�e��a�r�r������p*(�yL�~���z+H�Ǌ�"�T
�t�`�����ȸnGV����R��0R�E�`d).�#�WY�S��	���n�]8jO9T֕��SH��2��4��屍mX�v+�ǐ��#Ay�����dPCf%(�!5�i�Ay�ge�1`s���8�KF�1������:�L��nEձsu�RQu�j��JE�
n�TT!.n,Qu�b�!E�;��y��<b5��GQ{l����#V%:bA�sl�'���D��_wA���hT;o�>-*��ݪQPy���V���3��U���Low�<v��Q��$������$�i��^Q{i���ړ�?ϭHԞD-�e���d
��xE���bD��V�\��;�j��oԝ|��dE��d�e}
5ԝL�eeC�Q��:6�%w,k�:JR��l�:z�n�:J�ղ�ʣ��W��ʣV]��<j�э%*O���/�jO!����Sl%�a��ʵ:&*P�"☨A��[�9�
j�_;�P��u���8�U�j�D-��j/&3jQ�J馈Q���J���jT�Vf�D5j�¨F��/!�jԎ��LT�F��Q���A��,>�!�f�85�hF���	i43�GB����h
d�1�B�qB�L��	Y43O,Ȣ���OȢ���V%A-b�~� �EL>�"j���3�	�;�sD-���PD-J�,��(R>NԢH�~�P�����D-���o)�kj�:cG���R�%g��$8nw��}wo��+�[����| �wq�]�O��8�|RY�����i�a���6��<;�F^�+u!�������������l��M��^���������c��˰ �������ϛs����k�9";i�<������Id乽2NCVe��b�xp)R��⑝2w�����3�yj,�|��~���~�CS��l�i��O!�T�2��u g�W�����bC      I   [   x��m
�  ��y�MlJ�Y�f��
:}��{��h�Z�Ђ/��؟%��?(��@`�0"'�J�WЗ��f��&k;[�u?R+*�~�v�      @   <   x�3�NM.�KI,��WH��-�I-��2A�̃��r��e��g��j0C�@����� ��$�      K   �   x�O;j�@�gN�'��_2Ƃ��L�@k���5+�@�M��@H������B�P�������|�뼫�yAu���ʷ�����+j�v�
^���X~�7t�z[j�	���IF�6`y�#��	��[�d=c�,V��+��zҹ�y��ѓ0��:vqvUʦZS��r�{�Gb�X����l��*�~`�S�K      M   �   x�U�=nAFk�{���+D	�����+��1�L�5r��b�(����=}��=eJ%�ʇ�$>��3�3��h��(Q��W�1|[��sJ���U���+�۳RӰ$��,��Q�̱(y�����?2���`�$J+�P���39�������kN7B7���d�PGjVts�&�l�J���n	�Hz1�]�`�҉��2?�	�u�      E   �   x����0 й�VJ��f"�.����q�H%7��}X��{'G�> "��p�2�١R,qhm\%n�n�]4�bO�IQA������d���q���u���%�IK{�p����|%�;C�F)�3*�     